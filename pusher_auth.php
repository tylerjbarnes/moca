<?php

define( 'WP_USE_THEMES', FALSE );
require( $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php' );

$profile = hpm_load_profile();
$is_manager = $profile->role == "manager" || $profile->role == "administrator";
$channel_name = $_POST['channel_name'];


global $wpdb;
$option_table = $wpdb->prefix . 'hpm_options';
$secret = $wpdb->get_var( "SELECT option_value FROM $option_table messages WHERE option_name = 'pusher_secret'" );
$key = $wpdb->get_var( "SELECT option_value FROM $option_table messages WHERE option_name = 'pusher_key'" );
$app_id = $wpdb->get_var( "SELECT option_value FROM $option_table messages WHERE option_name = 'pusher_app_id'" );



if ( $is_manager && $channel_name == "private-managers" )
{
    $pusher = new Pusher($key, $secret, $app_id); // dev
    echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
}
elseif ( $profile->role == "contractor" && $channel_name == "private-contractor-{$profile->id}" ) {
    $pusher = new Pusher($key, $secret, $app_id); // dev
    echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
}
elseif ( $profile && $channel_name == "presence-all" ) {
    $presence_data = [
        "name" => $profile->name
    ];
    $pusher = new Pusher($key, $secret, $app_id); // dev
    echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $profile->id, $presence_data);
}
else
{
    header('', true, 403);
    echo "Forbidden";
}
