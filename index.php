<?php
    if (is_user_logged_in() && hpm_user_role() == "client") {
        header("Location: /client-portal"); /* Redirect browser */
        exit();
    }
    if (!is_user_logged_in()) {
        header("Location: /login"); /* Redirect browser */
        exit();
    }
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
  <head>
    <title>moca</title>

    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <script>
        var ajaxurl = "<?php echo admin_url('admin-ajax.php'); ?>";
        var pluginUrl = "<?php echo plugins_url( null, __FILE__ ); ?>";
        var PAGESLUG = "<?php echo "dashboard"; ?>";
        var appState = {
            mode: "<?php echo get_query_var('tab') ? get_query_var('tab') : "projects"; ?>",
            itemId: "<?php echo get_query_var('item'); ?>" ? "<?php echo get_query_var('item'); ?>" : null
        };
        if (appState.mode == 'people') {
            appState.mode = 'persons';
        }
    </script>
  </head>
  <body>
    <div id="app"></div>
    <script src="http://localhost:8080/dist/build.js"></script>
    <!-- <script src="/dist/build.js"></script> -->
  </body>
</html>