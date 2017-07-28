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
