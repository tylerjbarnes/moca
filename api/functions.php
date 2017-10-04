<?php

/**
 * Get (Current) User Data
 * @param  String $property
 * @param  Int $wp_id
 * @return String
 */
function hpm_user_data( $property, $wp_id = null) {

    $wp_id = $wp_id ? $wp_id : get_current_user_id();

    global $wpdb;
    $table = $wpdb->prefix . "hpm_persons";
    $var = $wpdb->get_var(
        "SELECT $property FROM $table WHERE wp_id = $wp_id"
    );
    return $var;

}
function hpm_user_id( $hpm_id = null ) { return hpm_user_data( 'id', $hpm_id ); }
function hpm_user_role( $hpm_id = null ) { return hpm_user_data( 'role', $hpm_id ); }
function hpm_user_name( $hpm_id = null ) { return hpm_user_data( 'name', $hpm_id ); }
function hpm_user_last_mutation_id( $hpm_id = null ) { return hpm_user_data( 'last_mutation_id', $hpm_id ); }

/**
 * Get Object
 * @param  String $id
 * @return Project
 */
function hpm_object( $type, $id ) {

    global $wpdb;
    $table = $wpdb->prefix . 'hpm_' . $type . 's';

    // Get Row from DB
    $row = $wpdb->get_row( "SELECT * FROM $table WHERE id = '$id'" );

    // Typify into Primitive
    $primitive = hpm_typify_data_from_db( $row );

    // Add Type-Specific Transformations & Return
    switch ( $type ) {
        case 'person': return hpm_attach_avatar( $primitive );
        default: return $primitive;
    }

}

/**
 * Get Pusher
 * @return Pusher
 */
function hpm_get_pusher() {

    $whitelist = array('127.0.0.1', "::1", 'localhost');
    if(in_array($_SERVER['REMOTE_ADDR'], $whitelist)){
        // Is localhost
        $options = array(
            'encrypted' => true,
            'cluster' => 'us2'
        );
        $pusher = new Pusher(
            '2a9730534281c98fb4b3',
            'cded72d30868b6e533dd',
            '368095',
            $options
        );

    } else {
        $options = array(
            'encrypted' => true
        );
        $pusher = new Pusher(
            '1f4e52f094e0cf3aafeb',
            '7a8fc6f85028e615fcc4',
            '290162',
            $options
        );

    }

    return $pusher;
}


/////////////////
// Data Typing //
/////////////////

/**
 * Restore Types Accessed from DB
 * @param  Object $data
 * @return Object type-restored object
 */
function hpm_typify_data_from_db( $data ) {
    $typified = new stdClass();

    foreach ($data as $key => $value) {
        if ($value == "" && in_array($key,[
            'property_name',
            'parent_id',
            'author_id',
            'project_id',
            'client_id',
            'meta',
            'wp_id',
            'cell_provider',
            'cell_number',
            'target',
            'due',
            'max',
            'autocycle',
            'contractor_id',
            'manager_id',
            'worker_id',
            'cycle',
            'package_id'
        ])) { $typified->$key = NULL; } else {
            switch ($key) {
                case 'archived':
                case 'flagged':
                case 'pending':
                case 'resolved':
                    $typified->$key = $value == 1;
                    break;
                case 'avatar':
                    $typified->$key = get_wp_user_avatar_src( $data->wp_id, 'thumbnail');
                    break;
                case 'memo':
                case 'name':
                    $typified->$key = stripslashes( $value );
                    break;
                case 'cycle':
                case 'time_offset':
                    $typified->$key = (int) $value;
                    break;
                case 'estimate':
                case 'hours':
                case 'max':
                case 'notification_time':
                    $typified->$key = abs((float) $value);
                    break;
                case 'content':
                case 'meta':
                case 'property_value':
                    $first_char = substr($value, 0, 1);
                    if ( $first_char === '{' || $first_char === '[' ) {
                        $typified->$key = hpm_typify_data_from_db( json_decode( $value ) );
                    } else {
                        $typified->$key = stripslashes( $value );
                    }
                    break;
                case 'static_balance':
                    $typified->$key = (float) $value;
                    break;
                default:
                    $typified->$key = $value;
                    break;
            }
        }
    }

    return $typified;
}

/**
 * Restore Types Sent from JS
 * @param  Object $data
 * @return Object type-restored object
 */
function hpm_typify_data_from_js( $data ) {
    $typified = [];

    foreach ($data as $key => $value) {
        switch ($key) {
            case 'archived':
            case 'flagged':
            case 'pending':
            case 'resolved':
                $typified[$key] = $value == 'true';
                break;
            case 'cycle':
            case 'time_offset':
                $typified[$key] = (int) $value;
                break;
            case 'estimate':
            case 'hours':
            case 'max':
            case 'notification_time':
                $typified[$key] = abs((float) $value);
                if (array_key_exists('type', $data) && $data['type'] !== 'purchase') {
                    $typified[$key] = $typified[$key] * -1;
                }
                break;
            default:
                $typified[$key] = $value;
                break;
        }
    }

    return $typified;
}






////////////////////////////////////////////////////////////////////////////////
// MIGRATION ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function get_cuid(){
    $cuid = new EndyJasmi\Cuid;
    return $cuid->cuid();
}

function hpm_import() {

    // PERSON MAP
    $person_map = [];

    // PERSONS
    $users_file = fopen(plugin_dir_path( __FILE__ ) . "../../old_users.csv","r");
    $i = 0;
    $persons = [];
    while( ( $data = fgetcsv($users_file) ) !== FALSE ) {
        // if ( $i > 5 ) { break; }
        if ( $i == 0 ) { $i++; continue; }
        $person = new stdClass();
        $person->id = get_cuid();
        $person->wp_id = $data[0];
        $person_map[$person->wp_id] = $person->id;
        $person->name = $data[9];
        $person->role = explode('"',$data[10])[1];
        $person->color = '#444444';
        $person->time_offset = -7;
        $person->notification_time = 9;
        $person->archived = 0;
        $persons[] = $person;
        $i++;
    }
    // echo "<pre>"; print_r( $persons ); echo "</pre>";

    // PROJECT MAP
    $project_map = [];

    // PROJECTS
    $projects_file = fopen(plugin_dir_path( __FILE__ ) . "../../old_projects.csv","r");
    $i = 0;
    $projects = [];
    while( ( $data = fgetcsv($projects_file) ) !== FALSE ) {
        // if ( $i > 5 ) { break; }
        if ( $i == 0 ) { $i++; continue; }
        $project = new stdClass();
        $project->legacy_id = $data[0];
        $project->id = get_cuid();
        $project_map[$project->legacy_id] = $project->id;
        $project->title = $data[1];
        $project->summary = $data[2];
        $project->resources = json_decode( $data[3] );
        $project->settings = $data[4];
        $project->client_id = $data[5];
        $project->contractor_id = $data[6] == 0 ? NULL : $data[6];
        $project->flagged = $data[7];
        $projects[] = $project;
        $i++;
    }
    // echo "<pre>"; print_r( $projects ); echo "</pre>";
    // echo "<pre>"; print_r( $resources ); echo "</pre>";
    // echo "<pre>"; print_r( $project_map ); echo "</pre>";

    // INSTANCES
    $instances_file = fopen(plugin_dir_path( __FILE__ ) . "../../old_instances.csv","r");
    $i = 0;
    $instances = [];
    while( ( $data = fgetcsv($instances_file) ) !== FALSE ) {
        if ( $i == 0 ) { $i++; continue; }
        $instance = new stdClass();
        $instance->id = $data[0];
        $instance->project_id = $data[1];
        $instance->start_date = $data[2];
        $instance->due_date = $data[3];
        $instance->target_hours = $data[4];
        $instance->max_hours = $data[5];
        $instance->completed = $data[6];
        $instances[] = $instance;
        $i++;
    }
    // echo "<pre>"; print_r( $instances ); echo "</pre>";

    // INSTANCE MAP
    $instance_map = [];
    foreach ($projects as $project) {
        $proj_instances = array_values(array_filter( $instances, function( $instance ) use ($project) {
            return $instance->project_id == $project->legacy_id;
        } ) );
        $cycleCounter = 0;
        foreach( $proj_instances as $instance ) {
            $entry = new stdClass();
            $entry->project_id = $project->id;
            $entry->cycle = $cycleCounter;
            $instance_map[$instance->id] = $entry;
            $cycleCounter++;
        }
    }
    // echo "<pre>"; print_r( $instance_map ); echo "</pre>";

    // MESSAGES
    $messages_file = fopen(plugin_dir_path( __FILE__ ) . "../../old_messages.csv","r");
    $i = 0;
    $messages = [];
    while( ( $data = fgetcsv($messages_file) ) !== FALSE ) {
        if ( $i == 0 ) { $i++; continue; }
        $message = new stdClass();
        $message->id = $data[0];
        $message->type = $data[1];
        $message->author_id = $data[2];
        $message->instance_id = $data[3];
        $message->parent_id = $data[4];
        $message->content = json_decode( stripslashes($data[5]) );
        $message->resolved = $data[6];
        $message->datetime = $data[7];
        $messages[] = $message;
        $i++;
    }
    // echo "<pre>"; print_r( $messages ); echo "</pre>";

    // TRANSACTIONS
    $transactions_file = fopen(plugin_dir_path( __FILE__ ) . "../../old_transactions.csv","r");
    $i = 0;
    $transactions = [];
    while( ( $data = fgetcsv($transactions_file) ) !== FALSE ) {
        if ( $i == 0 ) { $i++; continue; }
        $transaction = new stdClass();
        $transaction->id = $data[0];
        $transaction->author_id = $data[1];
        $transaction->client_id = $data[2];
        $transaction->instance_id = $data[3];
        $transaction->type = $data[4];
        $transaction->hours = $data[5];
        $transaction->date = $data[6];
        $transaction->expiration_date = $data[7];
        $transaction->memo = $data[8];
        $transaction->pending = $data[9];
        $transactions[] = $transaction;
        $i++;
    }
    // echo "<pre>"; print_r( $transactions ); echo "</pre>";



    $activities = [];
    $times = [];

    $new_projects = [];
    $i = 0;
    foreach ($projects as $project) {
        // if ( $i > 1 ) { break; }

        $new_project = new stdClass();

        // get instances
        $proj_instances = array_values(array_filter( $instances, function( $instance ) use ($project) {
            return $instance->project_id == $project->legacy_id;
        } ) );
        $last_index = count( $proj_instances ) - 1;
        $latest_instance = $proj_instances[$last_index];

        // build project
        $new_project->id = $project->id;
        $new_project->name = $project->title;
        $new_project->start = $latest_instance->start_date;
        $new_project->target = NULL;
        $new_project->due = $latest_instance->due_date;
        $new_project->estimate = $latest_instance->target_hours;
        $new_project->max = $latest_instance->max_hours == 'NULL' ? NULL : $latest_instance->max_hours;
        $new_project->autocycle = NULL;
        $new_project->cycle = (int) count($proj_instances) - 1;
        $new_project->status = 'delegate';
        $new_project->flagged = $project->flagged;
        $new_project->client_id = $person_map[$project->client_id];
        $new_project->contractor_id = $person_map[$project->contractor_id];
        $new_project->manager_id = NULL;
        $new_project->archived = $latest_instance->completed;
        $new_projects[] = $new_project;

        // build activity for instance history
        $first = true;
        $prev_estimate = NULL;
        $prev_max = NULL;
        foreach( $proj_instances as $instance ) {

            if ($first) {
                $activity = new stdClass();
                $activity->activity_type = "create";
                $activity->object_type = "projects";
                $activity->object_id = $new_project->id;
                $activity->property_name = NULL;
                $activity->property_value = new stdClass();
                    $activity->property_value->client_id = $new_project->client_id;
                    $activity->property_value->name = $new_project->name;
                    $activity->property_value->start = $instance->start_date;
                    $activity->property_value->due = $instance->due_date;
                    $activity->property_value->estimate = $instance->target_hours;
                    $activity->property_value->max = $instance->max_hours;
                    $activity->property_value->autocycle = $new_project->autocycle;
                    $activity->property_value->manager_id = $new_project->manager_id;
                    $activity->property_value->status = 'delegate';
                    $activity->property_value->flagged = 0;
                $activity->author_id = 1; // @todo old style person id
                $activity->datetime = date_create($instance->start_date)->format("Y-m-d H:i:s");
                $activities[] = $activity;
            } else {

                // set up start & due
                $props = [
                    'start' => $instance->start_date,
                    'due' => $instance->due_date
                ];

                // set up est & max only if changed
                if ($instance->target_hours != $prev_estimate) {
                    $props['estimate'] = $instance->target_hours;
                }
                if ($instance->max_hours != $prev_max) {
                    $props['max'] = $instance->max_hours;
                }
                $prev_estimate = $instance->target_hours;
                $prev_max = $instance->max_hours;

                // create activities for start/due/est/max to make instance history
                foreach ($props as $property_name => $property_value) {
                    $activity = new stdClass();
                    $activity->activity_type = "update";
                    $activity->object_type = "projects";
                    $activity->object_id = $new_project->id;
                    $activity->property_name = $property_name;
                    $activity->property_value = $property_value;
                    $activity->author_id = 1; // @todo old style person id
                    $activity->datetime = date_create($instance->start_date)->format("Y-m-d H:i:s");
                    $activities[] = $activity;
                }

            }

            $first = false;
        }

        // build non-summary resources
        if ( count( $project->resources ) ) {
            foreach( $project->resources as $resource_datum ){
                $resource = new stdClass();
                $resource->id = get_cuid();
                $resource->name = $resource_datum->title;
                $resource->client_id = $person_map[$project->client_id];
                $resource->project_id = $new_project->id;
                $resource->cycle = 0;
                $resource->type = NULL;
                $resource->content = new stdClass();
                    $resource->content->body = $resource_datum->content;
                    $resource->content = json_encode( $resource->content );
                $resources[] = $resource;
            }
        }

        // add summaries to resources
        if ( $project->summary ) {
            $resource = new stdClass();
            $resource->id = get_cuid();
            $resource->name = 'Overview';
            $resource->client_id = $person_map[$project->client_id];
            $resource->project_id = $new_project->id;
            $resource->cycle = 0;
            $resource->type = NULL;
            $resource->content = new stdClass();
                $resource->content->body = $project->summary;
                $resource->content = json_encode( $resource->content );
            $resources[] = $resource;
        }

        // project-linked time logs
        $project_logs = array_filter( $transactions, function($transaction) use($project, $instance_map) {
            return $transaction->type == 'log' && $instance_map[$transaction->instance_id]->project_id == $project->id;
        });
        foreach( $project_logs as $log ) {
            $time = new stdClass();
            $time->id = get_cuid();
            $time->type = 'log';
            $time->hours = $log->hours;
            $time->client_id = $person_map[$project->client_id];
            $time->worker_id = $person_map[$log->author_id];
            $time->memo = $log->memo;
            $time->project_id = $instance_map[$log->instance_id]->project_id;
            $time->cycle = $instance_map[$log->instance_id]->cycle;
            $time->date = $log->date;
            $time->pending = 0;
            $times[] = $time;
        }


        $i++;
    }


    // projectless time logs
    $client_logs = array_filter( $transactions, function($transaction) {
        return $transaction->type == 'log' && $transaction->instance_id == 'NULL';
    });
    foreach( $client_logs as $log ) {
        $time = new stdClass();
        $time->id = get_cuid();
        $time->type = 'log';
        $time->hours = $log->hours;
        $time->client_id = $person_map[$log->client_id];
        $time->worker_id = $person_map[$log->author_id];
        $time->memo = $log->memo;
        $time->project_id = NULL;
        $time->cycle = NULL;
        $time->date = $log->date;
        $time->pending = 0;
        $times[] = $time;
    }


    // packages, expirations, extensions
    //
    //
    $packages = [];
    //
    // echo '<pre>'; var_dump ( $transactions ); echo '</pre>';
    $clients = array_filter( $persons, function($person){
        return $person->role == "client\\";
    });
    foreach( $clients as $client ) {

        $client_transactions = array_filter( $transactions, function($transaction) use($client) {
            return $transaction->client_id == $client->wp_id;
        });

        $current_package = NULL;
        foreach( $client_transactions as $transaction ) {
            switch ($transaction->type) {
                case 'package':

                    // commit the last package now that we're done with it
                    if ($current_package) {
                        $packages[] = $current_package;
                    }

                    // - create the package
                    $current_package = new stdClass();
                    $current_package->id = get_cuid();
                    $current_package->client_id = $person_map[$transaction->client_id];
                    $current_package->hours = $transaction->hours;
                    $current_package->expiration_date = $transaction->expiration_date;

                    // - create the purchase
                    $time = new stdClass();
                    $time->id = get_cuid();
                    $time->type = 'purchase';
                    $time->hours = $transaction->hours;
                    $time->client_id = $person_map[$transaction->client_id];
                    $time->cycle = 0;
                    $time->package_id = $current_package->id;
                    $time->date = $transaction->date;
                    $time->pending = 0;
                    $times[] = $time;
                    // - package creation activity
                    $activity = new stdClass();
                    $activity->activity_type = 'create';
                    $activity->object_type = 'packages';
                    $activity->object_id = $current_package->id;
                    $activity->property_value = new stdClass();
                        $activity->property_value->id = $current_package->id;
                        $activity->property_value->hours = $current_package->hours;
                        $activity->property_value->expiration_date = $current_package->expiration_date;
                        // $activity->property_value = json_encode( $activity->property_value );
                    $activity->author_id = 1;
                    $activity->datetime = date_create($time->date)->format("Y-m-d H:i:s");
                    $activities[] = $activity;
                    // - purchase time log activity
                    $activity = new stdClass();
                    $activity->activity_type = 'create';
                    $activity->object_type = 'times';
                    $activity->object_id = $time->id;
                    $activity->property_value = new stdClass();
                        $activity->property_value->id = $time->id;
                        $activity->property_value->type = 'purchase';
                        $activity->property_value->hours = $time->hours;
                        $activity->property_value->client_id = $time->client_id;
                        $activity->property_value->package_id = $time->package_id;
                        $activity->property_value->date = $time->date;
                        // $activity->property_value = json_encode( $activity->property_value );
                    $activity->author_id = 1;
                    $activity->datetime = date_create($time->date)->format("Y-m-d H:i:s");
                    $activities[] = $activity;
                    break;

                case 'extension':
                    // - modify the last found package
                    $current_package->expiration_date = $transaction->expiration_date;
                    // - add the activity for that modification
                    $activity = new stdClass();
                    $activity->activity_type = 'update';
                    $activity->object_type = 'packages';
                    $activity->object_id = $current_package->id;
                    $activity->property_name = 'expiration_date';
                    $activity->property_value = $transaction->expiration_date;
                    $activity->author_id = 1;
                    $activity->datetime = date_create($transaction->date)->format("Y-m-d H:i:s");
                    $activities[] = $activity;
                    break;

                case 'expiration':
                    // - add the expiration time entry pointing to the last found package
                    $time = new stdClass();
                    $time->id = get_cuid();
                    $time->type = 'expiration';
                    $time->hours = $transaction->hours;
                    $time->client_id = $person_map[$transaction->client_id];
                    $time->cycle = 0;
                    $time->package_id = $current_package->id;
                    $time->date = $transaction->date;
                    $time->pending = 0;
                    $times[] = $time;
                    // - add the activity for that modification pointing to the last found package
                    $activity = new stdClass();
                    $activity->activity_type = 'create';
                    $activity->object_type = 'times';
                    $activity->object_id = $time->id;
                    $activity->property_value = new stdClass();
                        $activity->property_value->id = $time->id;
                        $activity->property_value->type = 'expiration';
                        $activity->property_value->hours = $time->hours;
                        $activity->property_value->client_id = $person_map[$time->client_id];
                        $activity->property_value->package_id = $time->package_id;
                        $activity->property_value->date = $time->date;
                        // $activity->property_value = json_encode( $activity->property_value );
                    $activity->author_id = 1;
                    $activity->datetime = date_create($time->date)->format("Y-m-d H:i:s");
                    $activities[] = $activity;
                    break;

                default:
                    break;
            }
        }
        // commit the VERY last package now that we're done with it
        if ($current_package) {
            $packages[] = $current_package;
        }

    }

    // messages
    $new_messages = [];
    foreach( $messages as $message ) {

        switch ($message->type) {
            case 'question':
                // create question
                $question = new stdClass();
                $question->id = get_cuid();
                $question->author_id = $person_map[$message->author_id];
                $question->project_id = $instance_map[$message->instance_id]->project_id;
                $question->cycle = $instance_map[$message->instance_id]->cycle;
                $question->content = $message->content->question;
                $question->resolved = $message->resolved > 0 ? 1 : 0;
                $question->datetime = $message->datetime;
                $new_messages[] = $question;
                // create answer
                $answer = new stdClass();
                $answer->id = get_cuid();
                $answer->parent_id = $question->id;
                $answer->author_id = $person_map[$message->content->answer_author_id];
                $answer->project_id = $instance_map[$message->instance_id]->project_id;
                $answer->cycle = $instance_map[$message->instance_id]->cycle;
                $answer->content = $message->content->answer;
                $answer->resolved = $message->resolved > 1 ? 1 : 0;
                $answer->datetime = $message->datetime;
                $new_messages[] = $answer;
                break;

            case 'submit':
                // activity moving to approve -no
                // activity moving to send -no
                // actually neither - we don't have tracking of these stages - this is not useful
                break;

            case 'note':
                // create note
                $note = new stdClass();
                $note->id = get_cuid();
                $note->author_id = $person_map[$message->author_id];
                $note->project_id = $instance_map[$message->instance_id]->project_id;
                $note->cycle = $instance_map[$message->instance_id]->cycle;
                $note->content = $message->content->message;
                $note->resolved = $message->resolved;
                $note->datetime = $message->datetime;
                $new_messages[] = $note;
                break;

            case 'extension':
                // not necessary - we already have the accurate due date
                // and no way to know the previous one
                break;

            default:
                break;
        }

    }


    // RUN //////////////////


    function import_vals( $table_name, $vals ) {
        global $wpdb;
        $table = $wpdb->prefix . "hpm_" . $table_name;
        $wpdb->insert(
            $table,
            $vals
        );
    }

    foreach( $activities as $activity ) {
        $prop_value = $activity->property_value;
        if ($activity->activity_type == 'create') {
            $prop_value = json_encode( $prop_value );
        }
        import_vals( "activity",
            [
                'id' => $activity->id,
                'activity_type' => $activity->activity_type,
                'object_type' => $activity->object_type,
                'object_id' => $activity->object_id,
                'property_name' => $activity->property_name,
                'property_value' => $prop_value,
                'author_id' => $activity->author_id,
                'datetime' => $activity->datetime
            ]
        );
    }

    // echo '<pre>'; var_dump( $new_messages ); echo '</pre>';
    foreach( $new_messages as $message ) {
        import_vals( "messages",
            [
                'id' => $message->id,
                'parent_id' => $message->parent_id,
                'author_id' => $message->author_id,
                'project_id' => $message->project_id,
                'cycle' => $message->cycle,
                'content' => $message->content,
                'meta' => $message->meta,
                'resolved' => $message->resolved,
                'datetime' => $message->datetime
            ]
        );
    }

    foreach( $packages as $package ) {
        import_vals( "packages",
            [
                'id' => $package->id,
                'client_id' => $package->client_id,
                'hours' => $package->hours,
                'expiration_date' => $package->expiration_date
            ]
        );
    }

    foreach( $new_projects as $project ) {
        import_vals( "projects",
            [
                'id' => $project->id,
                'name' => $project->name,
                'start' => $project->start,
                'target' => $project->target,
                'due' => $project->due,
                'estimate' => $project->estimate,
                'max' => $project->max,
                'autocycle' => $project->autocycle,
                'cycle' => $project->cycle,
                'status' => $project->status,
                'flagged' => $project->flagged,
                'client_id' => $project->client_id,
                'contractor_id' => $project->contractor_id,
                'manager_id' => $project->manager_id,
                'archived' => $project->archived,
            ]
        );
    }

    foreach( $resources as $resource ) {
        import_vals( "resources",
            [
                'id' => $resource->id,
                'name' => $resource->name,
                'client_id' => $resource->client_id,
                'project_id' => $resource->project_id,
                'cycle' => $resource->cycle,
                'type' => 'simple',
                'content' => $resource->content
            ]
        );
    }

    foreach( $times as $time ) {
        import_vals( "times",
            [
                'id' => $time->id,
                'type' => $time->type,
                'hours' => $time->hours,
                'worker_id' => $time->worker_id,
                'client_id' => $time->client_id,
                'project_id' => $time->project_id,
                'cycle' => $time->cycle,
                'memo' => $time->memo,
                'package_id' => $time->package_id,
                'date' => $time->date,
                'pending' => $time->pending,
            ]
        );
    }

    foreach( $persons as $person ) {
        import_vals( "persons",
            [
                'id' => $person->id,
                'wp_id' => $person->wp_id,
                'name' => $person->name,
                'role' => $person->role,
                'color' => $person->color,
                'time_offset' => $person->time_offset,
                'cell_provider' => $person->cell_provider,
                'cell_number' => $person->cell_number,
                'notification_time' => $person->notification_time,
                'archived' => $person->archived
            ]
        );
    }

}
