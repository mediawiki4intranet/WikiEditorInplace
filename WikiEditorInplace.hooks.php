<?php

class WikiEditorInplace
{
    public static function getPreferences($user, &$prefs)
    {
        global $wgVersion;
        $prefs['wikieditor-inplace'] = array(
            'type' => 'toggle',
            'label-message' => 'wei-enable',
            'section' => 'editing/'.(version_compare($wgVersion, '1.23', '>=') ? 'labs' : 'beta'),
        );
        return true;
    }

    public static function getFeaturesModulesList($editPage)
    {
        global $wgOut;
        WikiEditorHooks::editPageShowEditFormInitial($editPage, $wgOut);
        return $wgOut->getModules();
    }

    /**
     * @global User $wgUser
     * @param Article $article
     * @param type $outputDone
     * @param type $pcache
     */
    public static function ArticleViewHeader(&$article, &$outputDone, &$pcache)
    {
        global $wgOut, $wgUser;
        $title = $article->getTitle();
        if ($title->userCan('edit') && $wgUser->getOption('wikieditor-inplace'))
        {
            $wgOut->addModules('WikiEditorInplace');
            $submit = wfMsg('savearticle');
            $preview = wfMsg('showpreview');
            $cancel = wfMsg('wei-cancel');

            $wgOut->addHtml(<<<HTML
<div id="wei-form-origin" style="display: none">
    <a id=""></a>
    <div class="wei-editor-block">
        <div>
            <form enctype="multipart/form-data" method="post" name="editform" action="">
                <textarea lang="ru" name="wpTextbox1" dir="ltr" style="" rows="25" cols="80" accesskey="," tabindex="1"></textarea>
                <div class="wei-editor-buttons">
                    <input type="submit" accesskey="s" value="$submit" name="wpSave">
                    <button class="wei-btn-preview">$preview</button>
                    <button class="wei-btn-cancel">$cancel</button>
                </div>
            </form>
        </div>
    </div>
    <div class="wei-preview-block"></div>
    <div style="clear: both"></div>
</div>
HTML
            );
        }
        return true;
    }

    public static function Ajax($pagename, $sectionIdx)
    {
        global $wgUser, $wgOut;
        $title = Title::newFromText($pagename);
        $result = array();
        if ($title->userCan('edit'))
        {
            $article = new Article($title);
            $section = null;
            $nextSection = null;
            foreach (($article->exists() ? $article->getParserOutput()->getSections() : array()) as $s)
            {
                if ($section != null && $s['level'] <= $section['level'])
                {
                    $nextSection = $s;
                    break;
                }
                if ($s['index'] == $sectionIdx)
                {
                    $section = $s;
                }
            }

            $text = mb_substr($article->getText(), $section['byteoffset']);
            if ($nextSection !== null)
            {
                $text = mb_substr ($text, 0, $nextSection['byteoffset'] - $section['byteoffset']);
            }
            $from = $section['anchor'];

            $to = ($nextSection === null ? null : $nextSection['anchor']);

            $oldConf = $wgOut->getJsConfigVars();
            $result = array(
                'text' => $text,
                'from' => $from,
                'to'   => $to,
                'modules' => self::getFeaturesModulesList(new EditPage($article)),
                'configs' => array_diff_assoc($wgOut->getJsConfigVars(), $oldConf),
                'section' => $section['index'],
                'token' => $wgUser->getEditToken(),
                'edittime' => $article->getTimestamp(),
                'formAction' => $title->getFullURL(array('action'=>'submit')),
            );
        }
        return json_encode($result);
    }
}
