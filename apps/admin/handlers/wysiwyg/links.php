<?php

function admin_links_sort ($a, $b) {
	if ($a['title'] == $b['title']) {
		return 0;
	}
	return ($a['title'] < $b['title']) ? -1 : 1;
}

$page->layout = false;

$menu = Webpage::query ('id, title, menu_title')
		->where ('access', 'public')
		->fetch_orig ();
$out = array ();
foreach ($menu as $pg) {
	$mt = (! empty ($pg->menu_title)) ? $pg->menu_title : $pg->title;
	$out[] = array ('url' => '/' . $pg->id, 'title' => $mt);
}
uasort ($out, 'admin_links_sort');

echo json_encode ($out);

?>