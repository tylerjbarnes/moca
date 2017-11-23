<?php

/**
 * Log Notification
 * @param  String $recipient_id
 * @param  String $content
 */
function hpm_log_notification( $recipient_id, $address, $content ) {

    $insert_data = [
        "recipient_id" => $recipient_id,
        "address" => $address,
        "content" => $content
    ];

    error_log( print_r($insert_data, true ) );

    global $wpdb;
    $table = $wpdb->prefix . "hpm_notifications";
    $wpdb->insert( $table, $insert_data );

}

/**
 * Send Notification
 * @param  String $recipient_id
 * @param  String $content
 */
function hpm_send_notification( $recipient_id, $content ) {

    // Get Text Address
    $recipient = hpm_object('person', $recipient_id );
    if ( !$recipient->cell_number ) { return; }
    switch ( $recipient->cell_provider ) {
        case 'verizon':
            $domain = "vtext.com";
            break;
        case 'att':
            $domain = "txt.att.net";
            break;
        case 'tmobile':
            $domain = "tmomail.net";
            break;
        case 'sprint':
            $domain = "messaging.sprintpcs.com";
            break;
        default: return;
    }
    $address = "{$recipient->cell_number}@{$domain}";

    // Log Notification
    hpm_log_notification( $recipient_id, $address, $content );

    // Send Notification
    mail( $address, "", $content );
    // mail( "9494229316@vtext.com", "", $content );
	// error_log( $address . ': ' . $content);

}

/**
 * Send Project-Assigned Notification
 * @param  String $contractor_id
 * @param  String $project_id
 */
function hpm_send_project_assigned_notification( $contractor_id, $project_id ) {

    $project_name = hpm_object('project', $project_id )->name;
    $content = "You have been assigned to $project_name.";

    hpm_send_notification( $contractor_id, $content );

}

/**
 * Send Client-Used-All-Hours Notification
 * @param  String $client_id
 */
function hpm_send_client_used_all_hours_notification( $client_id ) {
    $client = hpm_object('person', $client_id );
	hpm_send_notification( "1", $client->name . " has used up their hours." );
}


///////////////
// Scheduled //
///////////////

function hpm_today_for_person( $person_id ) {

	$user_time_offset = hpm_object('person', $person_id )->time_offset;

	$today = new DateTime();
	$timezoneName = timezone_name_from_abbr("", $user_time_offset*3600, false);
	$today->setTimezone( new DateTimeZone( $timezoneName ) );

	return $today;

}

function hpm_get_projects_due_tomorrow() {

	$projects = hpm_get_current_projects();

	$projects_due_tomorrow = [];

	if (is_array( $projects )) {
        error_log( "Found " . count( $projects ) . " projects."); // TEMP
        foreach( $projects as $project ) {

    		if (!$project->contractor_id || !$project->due) {
    			continue;
    		}

    		$contractor_today = hpm_today_for_person( $project->contractor_id );
    		$contractor_tomorrow = $contractor_today->modify('+1 day');
    		$cont_tomorrow_string = $contractor_tomorrow->format("Y-m-d");

    		if ($project->due == $cont_tomorrow_string) {
    			$projects_due_tomorrow[] = $project;
    		}

    	}
	} else {
        error_log( $projects ); // TEMP
    }

	return $projects_due_tomorrow;

}

function hpm_person_notification_hour_utc( $person_id ) {

	$user_time_offset = hpm_object('person', $person_id )->time_offset;
	$user_time_zone = timezone_name_from_abbr("", $user_time_offset*3600, false);

	$user_notify_time = hpm_object('person', $person_id )->notification_time;

	$hour_as_entered = new DateTime();
	$hour_as_entered->setTimezone( new DateTimeZone( $user_time_zone ) );
	$hour_as_entered->setTime( $user_notify_time, 0, 0 );

	$hour_utc = $hour_as_entered->setTimezone( new DateTimeZone( 'UTC' ) );
	return $hour_utc->format("H");

}

function hpm_send_project_due_notification($project) {

	hpm_send_notification(
		$project->contractor_id,
		"Your project, $project->name, is due tomorrow."
 	);

}

function hpm_send_project_due_notifications() {

	$projects = hpm_get_projects_due_tomorrow();
	$now_utc = new DateTime();
	$now_utc->setTimezone( new DateTimeZone("UTC"));

	foreach( $projects as $project ) {

		$contractor_notification_hour = hpm_person_notification_hour_utc( $project->contractor_id );
		if ( $contractor_notification_hour == $now_utc->format('H') ) {
			hpm_send_project_due_notification( $project );
		}

	}

}
