<?php

namespace App\Utils;

use Closure;

class Router
{
    /**
     * Registered routes table.
     */
    private array $routes = [];

    /**
     * Current route group prefix.
     */
    private string $currentGroupPrefix = '';

    /**
     * Current route group middleware.
     */
    private array $currentGroupMiddleware = [];

    /**
     * Register a GET route.
     *
     * @param string $path
     * @param callable|array|string $handler
     * @param array $middleware
     * @return self
     */
    public function get(string $path, callable|array|string $handler, array $middleware = []): self
    {
        return $this->addRoute('GET', $path, $handler, $middleware);
    }

    /**
     * Register a POST route.
     *
     * @param string $path
     * @param callable|array|string $handler
     * @param array $middleware
     * @return self
     */
    public function post(string $path, callable|array|string $handler, array $middleware = []): self
    {
        return $this->addRoute('POST', $path, $handler, $middleware);
    }

    /**
     * Register a PUT route.
     *
     * @param string $path
     * @param callable|array|string $handler
     * @param array $middleware
     * @return self
     */
    public function put(string $path, callable|array|string $handler, array $middleware = []): self
    {
        return $this->addRoute('PUT', $path, $handler, $middleware);
    }

    /**
     * Register a PATCH route.
     *
     * @param string $path
     * @param callable|array|string $handler
     * @param array $middleware
     * @return self
     */
    public function patch(string $path, callable|array|string $handler, array $middleware = []): self
    {
        return $this->addRoute('PATCH', $path, $handler, $middleware);
    }

    /**
     * Register a DELETE route.
     *
     * @param string $path
     * @param callable|array|string $handler
     * @param array $middleware
     * @return self
     */
    public function delete(string $path, callable|array|string $handler, array $middleware = []): self
    {
        return $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    /**
     * Register an OPTIONS route.
     *
     * @param string $path
     * @param callable|array|string $handler
     * @param array $middleware
     * @return self
     */
    public function options(string $path, callable|array|string $handler, array $middleware = []): self
    {
        return $this->addRoute('OPTIONS', $path, $handler, $middleware);
    }

    /**
     * Register a route matching any method.
     *
     * @param string $path
     * @param callable|array|string $handler
     * @param array $middleware
     * @return self
     */
    public function any(string $path, callable|array|string $handler, array $middleware = []): self
    {
        $methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];
        foreach ($methods as $method) {
            $this->addRoute($method, $path, $handler, $middleware);
        }
        return $this;
    }

    /**
     * Define a group of routes with common prefix and middleware.
     *
     * @param string $prefix
     * @param Closure $callback
     * @param array $middleware
     * @return self
     */
    public function group(string $prefix, Closure $callback, array $middleware = []): self
    {
        $previousPrefix = $this->currentGroupPrefix;
        $previousMiddleware = $this->currentGroupMiddleware;

        $this->currentGroupPrefix = $previousPrefix . '/' . trim($prefix, '/');
        $this->currentGroupMiddleware = array_merge($previousMiddleware, $middleware);

        $callback($this);

        $this->currentGroupPrefix = $previousPrefix;
        $this->currentGroupMiddleware = $previousMiddleware;

        return $this;
    }

    /**
     * Internal method to add route definition.
     *
     * @param string $method
     * @param string $path
     * @param callable|array|string $handler
     * @param array $middleware
     * @return self
     */
    private function addRoute(string $method, string $path, callable|array|string $handler, array $middleware = []): self
    {
        $fullPath = $this->currentGroupPrefix . '/' . trim($path, '/');
        $fullPath = '/' . trim($fullPath, '/');
        if ($fullPath === '') {
            $fullPath = '/';
        }

        $allMiddleware = array_merge($this->currentGroupMiddleware, $middleware);

        // Convert path parameter pattern to regex
        // e.g. /tours/{id} -> /tours/(?P<id>[^/]+)
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $fullPath);
        $pattern = '#^' . $pattern . '$#';

        $this->routes[] = [
            'method' => strtoupper($method),
            'path' => $fullPath,
            'pattern' => $pattern,
            'handler' => $handler,
            'middleware' => $allMiddleware,
        ];

        return $this;
    }

    /**
     * Dispatch the current HTTP request to matching route.
     *
     * @param string|null $method
     * @param string|null $uri
     * @return void
     */
    public function dispatch(?string $method = null, ?string $uri = null): void
    {
        $requestMethod = $method ?? Request::getMethod();
        $requestPath = $uri ?? Request::getPath();

        $pathMatched = false;
        $allowedMethodsForPath = [];

        foreach ($this->routes as $route) {
            if (preg_match($route['pattern'], $requestPath, $matches)) {
                $pathMatched = true;
                $allowedMethodsForPath[] = $route['method'];

                if ($route['method'] === $requestMethod) {
                    // Extract named parameters
                    $params = array_filter($matches, fn($key) => !is_numeric($key), ARRAY_FILTER_USE_KEY);

                    // Execute Route Middleware
                    foreach ($route['middleware'] as $mw) {
                        $mwInstance = is_string($mw) ? new $mw() : $mw;
                        if (is_callable([$mwInstance, 'handle'])) {
                            $mwInstance->handle();
                        }
                    }

                    // Execute Route Handler
                    $this->executeHandler($route['handler'], $params);
                    return;
                }
            }
        }

        if ($pathMatched) {
            // 405 Method Not Allowed
            header('Allow: ' . implode(', ', array_unique($allowedMethodsForPath)));
            Response::error("Method {$requestMethod} not allowed for path {$requestPath}", 405, [
                'allowed_methods' => array_values(array_unique($allowedMethodsForPath)),
            ]);
            return;
        }

        // 404 Not Found
        Response::error("Endpoint {$requestMethod} {$requestPath} not found", 404);
    }

    /**
     * Execute controller action or closure handler.
     *
     * @param callable|array|string $handler
     * @param array $params
     * @return void
     */
    private function executeHandler(callable|array|string $handler, array $params): void
    {
        $positionalParams = array_values($params);

        if (is_callable($handler)) {
            $response = call_user_func_array($handler, $positionalParams);
            if (is_array($response)) {
                Response::json($response);
            }
            return;
        }

        if (is_array($handler) && count($handler) === 2) {
            [$class, $method] = $handler;
            $instance = is_string($class) ? new $class() : $class;
            $response = call_user_func_array([$instance, $method], $positionalParams);
            if (is_array($response)) {
                Response::json($response);
            }
            return;
        }

        Response::error('Invalid route handler configuration', 500);
    }
}
