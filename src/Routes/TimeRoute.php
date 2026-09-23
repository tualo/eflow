<?php

namespace Tualo\Office\Eflow\Routes;

use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\RouteSecurityHelper;
use Tualo\Office\Eflow\Services\TimeService;

class TimeRoute extends \Tualo\Office\Basic\RouteWrapper
{
    public static function register()
    {
        BasicRoute::add('/eflow/time', function ($matches) {
            $time = TimeService::getServerTime();
            $time['request_count'] = isset($_SESSION['eflow_request_count']) ? (int) $_SESSION['eflow_request_count'] : 0;


            // wenn möglich nicht verwenden
            // return json_encode($time);

            // besser so
            App::result('data',  $time);
            App::result('success', $time !== false);
            App::result('msg', ($time === false) ? 'Ein Fehler trat auf' : '');
        }, ['get'], false);
    }
}
