<?php

// Avoid Initializing Entire WP App
define( 'WP_USE_THEMES', FALSE );
require( $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php' );

// Get User Info
$user_id = hpm_user_id();
$user_role = hpm_user_role();
$user_name = hpm_user_name();
$is_manager = $user_role == "manager" || $user_role == "administrator";

// Get Channel Info
$channel_name = $_POST['channel_name'];
global $wpdb;
$option_table = $wpdb->prefix . 'hpm_options';
$secret = $wpdb->get_var( "SELECT option_value FROM $option_table messages WHERE option_name = 'pusher_secret'" );
$key = $wpdb->get_var( "SELECT option_value FROM $option_table messages WHERE option_name = 'pusher_key'" );
$app_id = $wpdb->get_var( "SELECT option_value FROM $option_table messages WHERE option_name = 'pusher_app_id'" );

// Authenticate
if ( $is_manager && $channel_name == "private-managers" ) {
    // Manager -> Manager Channel
    $pusher = new Pusher($key, $secret, $app_id);
    echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
} elseif ( $user_role == "contractor" && $channel_name == "private-contractor-{$user_id}" ) {
    // Contractor -> Own Contractor Channel
    $pusher = new Pusher($key, $secret, $app_id);
    echo $pusher->socket_auth($_POST['channel_name'], $_POST['socket_id']);
} elseif ( $user_name && $channel_name == "presence-all" ) {
    // Presence Channel
    $presence_data = ["name" => $user_name];
    $pusher = new Pusher($key, $secret, $app_id);
    echo $pusher->presence_auth($_POST['channel_name'], $_POST['socket_id'], $user_id, $presence_data);
} else {
    // Reject All Else
    header('', true, 403);
    echo "Forbidden";
}
