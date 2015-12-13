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
        if (!window.InplaceEditor.restoreAll())
        {
            // Ask for a confirmation
            return;
        }
        $.ajax({
            type: "POST",
            url: mw.util.wikiScript(),
            data: {
                action: 'ajax',
                rs: 'WikiEditorInplace::Ajax',
                rsargs: [ mw.config.get('wgPageName'), section ]
            },
            dataType: 'json',
            success: function(result)
            {
                window.InplaceEditor.showForm(result);
            }
        });
    }
    $('.editsection > a, .mw-editsection > a').click(function(e)
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

window.InplaceEditor =
{
    restoreAll: function()
    {
        var d = $('div.InplaceEditorHTMLHolder');
        var t = d.next().find('textarea')[0];
        if (t && t.value != t._origText && !confirm(mw.msg('wei-confirm-close')))
        {
            return false;
        }
        d.next().remove();
        d.after(d.contents());
        d.remove();
        return true;
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
        div.id = 'block_' + result.from;
        div.className = 'InplaceEditorHTMLHolder';
        $first.before(div);

        var current = $first[0], next;
        while (current && (result.to == null || $(current).children('span.mw-headline').attr('id') != result.to))
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

        $input = $editor.find('textarea')[0];
        $input.value = $input._origText = result.text;
        $input.id = 'wpTextbox1';
        $editor.find('input[type=submit]').attr('id', 'wpSave');
        var doShowForm = function()
        {
            $('#wpTextbox1').wikiEditor();
            $('#editform .wikiEditor-ui-controls').hide();
            $('#editform button.wei-btn-preview').click(window.InplaceEditor.preview);
            $('#editform button.wei-btn-cancel').click(function() { window.InplaceEditor.restoreAll(); return false; });
            $('.wei-preview-block').html('');
            var $preview = $('#editform .wikiEditor-ui-view.wikiEditor-ui-view-preview');
            $('.wei-preview-block').append($preview);
            $preview.css({ display: '' });
        };
        mw.config.set(result.configs);
        mw.loader.using(result.modules, function()
        {
            doShowForm();
        });
    }
};
