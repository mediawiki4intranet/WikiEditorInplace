<?php

/**
 * In-place page section editing extension for MediaWiki & WikiEditor
 *
 * Copyright © 2014+ Vladimir Koptev, Vitaliy Filippov
 * http://wiki.4intra.net/WikiEditorInplace
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 * http://www.gnu.org/copyleft/gpl.html
 */

/**
 * TODO:
 * - Drafts compatibility
 * - Fix mid-air collisions, especially with newly added sections
 * - Confirm closing inplace editor when there are modifications
 */

$wgExtensionCredits['other'][] = array(
	'name'        => 'WikiEditorInplace',
	'author'      => 'Vladimir Koptev, Vitaliy Filippov',
	'version'     => '2014-01-27',
	'description' => 'In-place page section editing extension for MediaWiki & WikiEditor',
	'url'         => 'http://wiki.4intra.net/WikiEditorInplace',
);

$wgResourceModules['WikiEditorInplace'] = array(
	'scripts'       => array('WikiEditorInplace.js'),
	'styles'        => array('WikiEditorInplace.css'),
	'dependencies'  => array('jquery'),
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'WikiEditorInplace',
	'position'      => 'top',
);
$wgExtensionMessagesFiles['WikiEditorInplace'] = __DIR__ . '/WikiEditorInplace.i18n.php';
$wgAutoloadClasses['WikiEditorInplace'] = __DIR__ . '/WikiEditorInplace.hooks.php';

$wgHooks['ArticleViewHeader'][] = 'WikiEditorInplace::ArticleViewHeader';
$wgHooks['GetPreferences'][] = 'WikiEditorInplace::GetPreferences';
$wgAjaxExportList[] = 'WikiEditorInplace::Ajax';
