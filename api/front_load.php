<?php



/**
 * Load App Data from DB
 * @return Object app data
 */
function hpm_api_load() {

    $response = new stdClass();
    $response->profile = hpm_load_profile();
    $response->persons = hpm_api_load_persons([
        // "archived" => "false"
    ]);
    $response->projects = hpm_api_load_projects([
        "archived" => "false"
    ]);
    $response->times = hpm_api_load_times([
        // "archived" => "false"
    ]);
    $response->resources = hpm_api_load_resources([
        // "archived" => "false"
    ]);
    $response->messages = hpm_api_load_messages([
        // "archived" => "false"
    ]);
    $response->packages = hpm_api_load_packages();
    return $response;
}


// start new moca version
