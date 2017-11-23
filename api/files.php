<?php

function hpm_api_upload_file( $folder, $socket_id ) {

    // Dropbox SDK
    $dropbox_app = new Kunnu\Dropbox\DropboxApp("e1jij6nj8hw7pkq", "it0tst5uozgjb44", "VWQafnb1Pq0AAAAAAAc4LzwnZFNJl5C3ZtjFCluKBxq5zlwBxi0h8U7h8ioy3Sp3");
    $dropbox = new Kunnu\Dropbox\Dropbox($dropbox_app);

    // Upload
    $dropboxFile = new Kunnu\Dropbox\DropboxFile($_FILES["file"]["tmp_name"]);
    $file = $dropbox->upload($dropboxFile, "/".$folder."/".$_FILES["file"]["name"]);

}

function hpm_api_list_files( $folder ) {

    // Dropbox SDK
    $dropbox_app = new Kunnu\Dropbox\DropboxApp("e1jij6nj8hw7pkq", "it0tst5uozgjb44", "VWQafnb1Pq0AAAAAAAc4LzwnZFNJl5C3ZtjFCluKBxq5zlwBxi0h8U7h8ioy3Sp3");
    $dropbox = new Kunnu\Dropbox\Dropbox($dropbox_app);

    // Get Items
    if ( !hpm_dropbox_folder_exists( $folder, $dropbox ) ) { return []; }
    $listFolderContents = $dropbox->listFolder("/".$folder);
    $items = $listFolderContents->getItems()->all();

    // Build items
    $files = array_map( function( $item ) use ( $dropbox ) {

        $path = $item->path_lower;
        $temporaryLink = $dropbox->getTemporaryLink($path);
        $url = $temporaryLink->getLink();

        return [
            "name" => $item->name,
            "url" => $url
        ];

    }, $items );

    return $files;

}

function hpm_dropbox_folder_exists( $folder, $dropbox ) {

    $listFolderContents = $dropbox->listFolder("/");
    $items = $listFolderContents->getItems()->all();
    $item_names = array_map( function( $item ) {
        return $item->name;
    }, $items );
    return in_array($folder, $item_names );

}
