// In-place page section editing for MediaWiki & WikiEditor
// License: Mozilla Public License 2.0 or later
// Author(s): Vladimir Koptev, Vitaliy Filippov

$(document).ready(function()
{
    function loadInplace(section)
    {
        if (document.getElementById('wei-'+section))
        {
            // To prevent double loading via #hash
            return;
        }
        $.ajax({
            type: "POST",
            url: mw.util.wikiScript(),
            data: {
                action: 'ajax',
                rs: 'WikiEditorInplace::Ajax',
                rsargs: [ wgPageName, section ]
            },
            dataType: 'json',
            success: function(result)
            {
                window.InplaceEditor.showForm(result);
                loading = null;
            }
        });
    }
    $('.editsection > a').click(function(e)
    {
        var href = $(this).attr('href');
        // skip inplace editing for sections included from templates, like T-(\d+)
        var section = /section=(\d+)/.exec(href);
        if (!section)
        {
            return true;
        }
        loadInplace(section[1]);
        return false;
    });
    // Support switching inplace editing on/off via back/next links
    if ('onhashchange' in window && (document.documentMode === undefined || document.documentMode >= 8))
    {
        $(window).on('hashchange', function()
        {
            var m = window.location.hash.match(/^#wei-([1-9]\d*)/)
            if (m)
            {
                loadInplace(m[1]);
            }
            else
            {
                window.InplaceEditor.restoreAll();
            }
        });
    }
});

window.InplaceEditor = {
    restoreAll: function()
    {
        $('div.InplaceEditorHTMLHolder').each(function()
        {
            $(this).next().remove();
            $(this).after($(this).contents());
            $(this).remove();
        });
        return false;
    },
    preview: function()
    {
        $('.wei-block').addClass('wei-preview-visible');
        $('#editform .wikiEditor-ui-controls .wikiEditor-ui-tabs > div').each(function()
        {
            if ($(this).attr('rel') === 'wikiEditor-ui-view-preview')
            {
                $(this).children('a').click();
                $('#editform .wikiEditor-ui-controls .wikiEditor-ui-tabs > div').first().children('a').click();
                return false;
            }
        });
        return false;
    },
    showForm: function (result)
    {
        window.InplaceEditor.restoreAll();
        var $first = null;
        $('span.mw-headline').each(function()
        {
            if (this.id == result.from)
            {
                $first = $(this).parent();
            }
        });
        var div = document.createElement('DIV');
        div.style.display = 'none';
        div.id = 'block_' + result.from
        div.className = 'InplaceEditorHTMLHolder';
        $first.before(div);

        var current = $first[0], next;
        while (current.nextSibling && (result.to == null || $(current.nextSibling).children('span.mw-headline').attr('id') != result.to))
        {
            next = current.nextSibling;
            div.appendChild(current);
            current = next;
        }

        var $editor = $('<div>'+$('#wei-form-origin').html()+'</div>');
        $editor.addClass('wei-block');
        $editor.children('a').first().attr('id', 'wei-' + result.section);
        $(div).after($editor);
        window.location.hash = '#wei-' + result.section;

        var $form = $editor.find('form');
        var $input = '<input type="hidden" name="wpSection" value="'+result.section+'"/>';
        $form.append($input);
        $input = '<input type="hidden" name="wpEditToken" value="'+result.token+'"/>';
        $form.append($input);
        $input = '<input type="hidden" name="wpEdittime" value="'+result.edittime+'"/>';
        $form.append($input);
        $form.attr('id', 'editform');
        $form.attr('action', result.formAction);

        $editor.find('textarea').text(result.text);
        $editor.find('textarea').attr('id', 'wpTextbox1');
        $editor.find('input[type=submit]').attr('id', 'wpSave');
        var showForm = function()
        {
            $('#wpTextbox1').wikiEditor();
            $('#editform .wikiEditor-ui-controls').hide();
            $('#editform button.wei-btn-preview').click(window.InplaceEditor.preview);
            $('#editform button.wei-btn-cancel').click(window.InplaceEditor.restoreAll);
            $('.wei-preview-block').html('');
            var $preview = $('#editform .wikiEditor-ui-view.wikiEditor-ui-view-preview');
            $('.wei-preview-block').append($preview);
            $preview.css({ display: '' });
        };
        mw.loader.using(result.modules, function()
        {
            showForm();
        });
    }
};
