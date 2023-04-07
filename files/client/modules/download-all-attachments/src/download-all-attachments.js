(function () {
    const self = this;

(function waitForEspo() {
    if (typeof self.Espo !== "undefined") {
        hookEspo();
        self.Espo.loader.setViewExtensionMap({
            "views/fields/attachment-multiple": ["download-all-attachments:extensions/views/fields/attachment-multiple"],
        });
    } else {
        setTimeout(waitForEspo, 10);
    }
})();

    function hookEspo() {
        const loader = self.Espo.loader;

        /**
         * Set map of which views map to new extended views.
         *
         * @param {Object} viewExtensionMap View extensions map.
         */
        loader.setViewExtensionMap = function (viewExtensionMap) {
            /**
             * Extension map is in the following format:
             * {
             *     'ViewName': [
             *         'ExtensionName1',
             *         'ExtensionName2',
             *         ...
             *     ],
             *     ...
             * }
             */
            this.viewExtensionMap = viewExtensionMap;

            /**
             * Dependency graph is converted to the following format:
             * {
             *    'ExtensionName1': 'ViewName',
             *    'ExtensionName2': 'ExtensionName1',
             *    ...
             * }
             */
            this._extensionsDependencyGraph = {};
            Object.entries(viewExtensionMap).forEach(([view, extensions]) => {
                let previousExtension = null;
                extensions.forEach(extension => {
                    if (!previousExtension) {
                        this._extensionsDependencyGraph[extension] = view;
                    } else {
                        this._extensionsDependencyGraph[extension] = previousExtension;
                    }
                    previousExtension = extension;
                });
            });
        };

        /**
         *  Get name of the module extension.
         *
         * @param {string} viewName Module view name.
         * @returns {string}
         */
        loader.getExtendedViewName = function (viewName) {
            if (this.viewExtensionMap && viewName in this.viewExtensionMap) {
                // the module must depend on the  LAST extension, which is going to depend on the other extensions and on the view
                // V1 <- E1 <- E2  -  E2 is being loaded first
                const viewExtensions = this.viewExtensionMap[viewName];
                return viewExtensions[viewExtensions.length - 1];
            }

            return viewName;
        };

        const _require = loader.require;
        loader.require = function (subject, callback, errorCallback) {
            if (!Array.isArray(subject)) {
                subject = subject ? [subject] : [];
            }

        if (!this._extending) {
            subject = subject.map(this.getExtendedViewName.bind(this));
        } else {
            this._extending = false;
        }

            _require.call(this, subject, callback, errorCallback);
        };

        const _define = loader.define;
        loader.define = function (name, dependencies, callback, extending) {
            if (!Array.isArray(dependencies)) {
                dependencies = dependencies ? [dependencies] : [];
            }

            if (extending !== true) {
                dependencies = dependencies.map(this.getExtendedViewName.bind(this));
            }

            _define.call(this, name, dependencies, callback);
        };

        loader.extend = function (subject, dependency, callback) {
            // define the extensions in such a way, so that they are dependent on each other and on the view
            const dependencies = [this._extensionsDependencyGraph[subject]].concat(dependency);

            this.define(subject, dependencies, callback, true);
        };

        /**
         * Extend defined module.
         *
         * @param {string} subject A module name of extension.
         * @param {string[]|Espo.Loader~requireCallback} [dependency] A dependency list or a callback with resolved
         *   dependencies.
         * @param {Espo.Loader~requireCallback} [callback] A callback with resolved dependencies.
         */
        self.extend = function (subject, dependency, callback) {
            if (typeof dependency === 'function') {
                callback = dependency;
                dependency = [];
            }

            if (typeof dependency === 'string') {
                dependency = [dependency];
            }

            loader.extend(subject, dependency, callback);
        };

        /**
         * Require a module or multiple modules.
         *
         * @param {string|string[]} subject A module or modules to require.
         * @param {Espo.Loader~requireCallback} callback A callback with resolved dependencies.
         * @param {Object} [context] A context.
         * @param {Function|null} [errorCallback] An error callback.
         */
        self.require = Espo.require = function (subject, callback, context, errorCallback) {
            if (context) {
                callback = callback.bind(context);
            }

            loader.require(subject, callback, errorCallback);
        };

    /**
     * Define an [AMD](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) module.
     *
     * 3 signatures:
     * 1. `(callback)` – Unnamed, no dependencies.
     * 2. `(dependencyList, callback)` – Unnamed, with dependencies.
     * 3. `(moduleName, dependencyList, callback)` – Named.
     *
     * @param {string|string[]|Espo.Loader~requireCallback} arg1 A module name to be defined,
     *   a dependency list or a callback.
     * @param {string[]|Espo.Loader~requireCallback} [arg2] A dependency list or a callback with resolved
     *   dependencies.
     * @param {Espo.Loader~requireCallback} [arg3] A callback with resolved dependencies.
     */
    self.define = Espo.define = function (arg1, arg2, arg3) {
        let subject = null;
        let dependency = null;
        let callback;

            if (typeof arg1 === 'function') {
                callback = arg1;
            } else if (typeof arg1 !== 'undefined' && typeof arg2 === 'function') {
                dependency = arg1;
                callback = arg2;
            } else {
                subject = arg1;
                dependency = arg2;
                callback = arg3;
            }

            loader.define(subject, dependency, callback);
        };
    }
}
)();