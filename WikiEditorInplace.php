<?php

$wgResourceModules['WikiEditorInplace'] = array(
	'scripts'       => array('WikiEditorInplace.js'),
	'styles'        => array('WikiEditorInplace.css'),
	'dependencies'  => array('jquery'),
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'WikiEditorInplace',
	'position'      => 'top',
);
$wgExtensionMessagesFiles['WikiEditorInplace'] = dirname(__FILE__).'/WikiEditorInplace.i18n.php';
$wgAutoloadClasses['WikiEditorInplace'] = dirname( __FILE__ ) . '/WikiEditorInplace.hooks.php';

$wgHooks['ArticleViewHeader'][] = 'WikiEditorInplace::ArticleViewHeader';
$wgAjaxExportList[] = 'WikiEditorInplace::Ajax';
