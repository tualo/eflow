<?php

namespace Tualo\Office\Eflow\Routes;

use Tualo\Office\Basic\TualoApplication as App;
use Tualo\Office\Basic\Route as BasicRoute;
use Tualo\Office\Basic\RouteSecurityHelper;
use Tualo\Office\Basic\IRoute;

class JsLoader extends \Tualo\Office\Basic\RouteWrapper
{
    public static function register()
    {
        BasicRoute::add('/jseflow/(?P<file>[\w.\/\-]+).js', function ($matches) {
            RouteSecurityHelper::serveSecureStaticFile(
                $matches['file'] . '.js',
                dirname(__DIR__, 1) . '/js/lazy/',
                ['js'],
                ['js' => 'application/javascript']
            );
        }, ['get'], false);
    }
}
