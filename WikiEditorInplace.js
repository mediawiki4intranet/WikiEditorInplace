// In-place page section editing for MediaWiki & WikiEditor
// License: Mozilla Public License 2.0 or later
// Author(s): Vladimir Koptev, Vitaliy Filippov

$(document).ready(function()
{
    $('.editsection > a').click(function(e)
    {
        var href = $(this).attr('href');
        // skip inplace editing for sections included from templates, like T-(\d+)
        var section = /section=(\d+)/.exec(href);
        if (!section)
        {
            return true;
        }
        section = section[1];
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
            }
        });
        return false;
    });
});

window.InplaceEditor = {
    context: null,
    restoreAll: function()
    {
        $('div.InplaceEditorHTMLHolder').each(function()
        {
            var $div = $(this);
            $div.next().remove();
            var $current = null;
            var $prev = $div;
            $div.children().each(function() {
                $current = $(this);
                $prev.after($current);
                $prev = $current;
            });
            $div.remove();
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
    addModule: {
        toolbar: function()
        {
            $('#toolbar').remove();
            $('textarea#wpTextbox1').wikiEditor(
                'addModule', $.wikiEditor.modules.toolbar.config.getDefaultConfig()
            );
        },
        other: function(name)
        {
            $('textarea#wpTextbox1').wikiEditor('addModule', name);
        }
    },
    showForm: function (result)
    {
        window.InplaceEditor.restoreAll();
        var $div = $('<div></div>');
        var $first = null;
        $('span.mw-headline').each(function()
        {
            if (this.id == result.from)
            {
                $first = $(this).parent();
            }
        });
        $first.before($div);
        $div.hide();
        $div.attr('id', 'block_' + result.from);
        $div.addClass('InplaceEditorHTMLHolder');

        var $current = $first.next();
        $div.append($first);
        var i = 0;
        while ($current.length > 0 && (result.to == null || $current.children('span.mw-headline').attr('id') != result.to))
        {
            var $next = $current.next();
            $div.append($current);
            $current = $next;
        }

        var $editor = $('<div></div>');
        $div.after($editor);
        $editor.addClass('wei-block');
        $editor.html($('#wei-form-origin').html());
        $editor.children('a').first().attr('id', 'link' + result.from);
        window.location.hash = '#link' + result.from;

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
            for (var i in window.InplaceEditor.context.modules)
            {
                if (i === 'toolbar')
                {
                    window.InplaceEditor.addModule.toolbar();
                }
                else
                {
                    window.InplaceEditor.addModule.other(i);
                }
            }
        };
        var postShowForm = function()
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
        if (window.InplaceEditor.context === null)
        {
            mw.loader.using(result.modules, function()
            {
                if (window.InplaceEditor.context === null)
                {
                    window.InplaceEditor.context = $('#wpTextbox1').data('wikiEditor-context');
                }
                else
                {
                    showForm();
                }
                postShowForm();
            });
        }
        else
        {
            showForm();
            postShowForm();
        }
    }
};
