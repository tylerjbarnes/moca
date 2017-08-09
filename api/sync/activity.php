<?php

/**
 * Perform and Log Activity
 * @param  Activity $activity
 * @return Activity now with id and timestamp
 */
function hpm_save_activity( $activity ) {

    global $wpdb;

    // Do Activity
    $table = $wpdb->prefix . "hpm_" . $activity->object_type;
    switch ( $activity->activity_type ) {

        case "update":
            $wpdb->update(
                $table,
                [ $activity->property_name => $activity->property_value ],
                [ "id" => $activity->object_id ]
            );
            break;

        case "create":
            // Message TimeZone
            if ( $activity->object_type == "messages" ) {
                $activity->property_value["datetime"] = gmdate("Y-m-d H:i:s");
            }

            $wpdb->insert(
                $table,
                $activity->property_value
            );
            $activity->property_value = json_encode($activity->property_value);
            break;

        case "delete":
            $wpdb->delete( $table, array( 'id' => $activity->object_id ) );
            break;

        default:
            break;

    }

    // Log Activity
    $table = $wpdb->prefix . "hpm_activity";
    // Activity TimeZone
    $activity->datetime = gmdate("Y-m-d H:i:s");
    $wpdb->insert(
        $table,
        (array) $activity,
        array("%s","%s","%s","%s","%s","%s")
    );

}

/**
 * Perform and Log Activities
 * @param  Array $activities
 */
function hpm_save_activities( $activities ) {
    foreach ($activities as $activity) {
        hpm_save_activity( $activity );
    }
}


function hpm_api_create_object( $type, $data, $socket_id ) {
    foreach ($data as $key => $value) {
        $data[$key] = $value !== '' ? $value : NULL;
    }
    $function_name = 'hpm_api_create_' . $type;
    $function_name( $data, $socket_id );
}

function hpm_api_update_object( $type, $id, $data, $socket_id ) {
    foreach ($data as $key => $value) {
        $data[$key] = $value !== '' ? $value : NULL;
    }
    $function_name = 'hpm_api_update_' . $type;
    $function_name( $id, $data, $socket_id );
}

function hpm_api_delete_object( $id, $socket_id ) {
    $function_name = 'hpm_api_delete_' . $type;
    $function_name( $id, $socket_id );
}
