<?php

define( 'WP_USE_THEMES', FALSE );
require( $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php' );

$profile = hpm_load_profile();
$is_manager = $profile->role == "manager" || $profile->role == "administrator";
$channel_name = $_POST['channel_name'];

if ( $is_manager && $channel_name == "private-managers" )
{
    // $pusher = new Pusher("1f4e52f094e0cf3aafeb", "7a8fc6f85028e615fcc4", "290162"); // production (key, secret, app_id)
    $pusher = new Pusher("2a9730534281c98fb4b3", "cded72d30868b6e533dd", "368095"); // dev
    echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
}
elseif ( $profile->role == "contractor" && $channel_name == "private-contractor-{$profile->id}" ) {
    // $pusher = new Pusher("1f4e52f094e0cf3aafeb", "7a8fc6f85028e615fcc4", "290162"); // production
    $pusher = new Pusher("2a9730534281c98fb4b3", "cded72d30868b6e533dd", "368095"); // dev
    echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
}
elseif ( $profile && $channel_name == "presence-all" ) {
    $presence_data = [
        "name" => $profile->name
    ];
    // $pusher = new Pusher("1f4e52f094e0cf3aafeb", "7a8fc6f85028e615fcc4", "290162"); // production
    $pusher = new Pusher("2a9730534281c98fb4b3", "cded72d30868b6e533dd", "368095"); // dev
    echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $profile->id, $presence_data);
}
else
{
    header('', true, 403);
    echo "Forbidden";
}
