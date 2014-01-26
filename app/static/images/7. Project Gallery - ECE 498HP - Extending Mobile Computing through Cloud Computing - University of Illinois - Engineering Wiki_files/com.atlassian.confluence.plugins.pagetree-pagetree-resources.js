jQuery(function($) {
    AJS.pagetree = {
        MAX_DEPTH : 999,
        MODE_EXPAND : true,
        MODE_COLLAPSE : false,

        treeRequests : {},
        targetPages : {},

        getContextPath : function() {
            return contextPath; /* Returns from Confluence's global 'contextPath' js variable. */
        },

        /**
         * mode: true=expand, false=collapse
         */
        toggleChild : function (id, mode, startDepth, clearStatusMessage) {
            // if no mode is set, toggle current mode
            if (mode == undefined || mode == null)
                mode = !this.getMode(id);

            //if no startDepth is set, default to zero
            if (startDepth == undefined || startDepth == null)
                startDepth = 0;

            // execute only if current state is different with target mode
            if (!this.isSimilarState(id, mode)) {
                var childrenDiv = $("#children" + id);

                if (this.hasChild(childrenDiv)) {
                    // toggle images
                    var link = $("#plusminus" + id);
                    if (mode == this.MODE_EXPAND) {
                        link.removeClass("icon-plus");
                        link.addClass("icon-minus");
                    } else {
                        link.removeClass("icon-minus");
                        link.addClass("icon-plus");
                    }

                    if (mode == this.MODE_EXPAND)
                        childrenDiv.slideDown(300);
                    else
                        childrenDiv.slideUp(300);

                    if (clearStatusMessage)
                        this.finishLoadingMessage(id);

                } else {
                    this.loadChildren(id, new Array(), startDepth, "", clearStatusMessage);
                }
            }


            if (clearStatusMessage) {
                this.finishLoadingMessage(id);
            }
        },

        /**
         * returns true if the given <div> element has a <ul> child node.
         */
        hasChild : function(childDiv) {
            return childDiv.children("ul[id]").length > 0;
        },

        /**
         * returns true if tree is already expanded, and false if it is already collapsed
         */
        getMode: function(id) {
            var icon = $("#plusminus" + id);

            return (icon.length > 0)
                    ? icon.hasClass("icon-minus")
                    : this.MODE_COLLAPSE;
        },

        isSimilarState : function(id, mode) {
            return this.getMode(id) == mode;
        },

        expandAll : function(id) {
            this.doExpandCollapseAll(id, this.MODE_EXPAND);
        },

        collapseAll : function(id) {
            this.doExpandCollapseAll(id, this.MODE_COLLAPSE);
        },

        /**
         * mode: true=expand, false=collapse
         */
        doExpandCollapseAll : function(id, mode) {
            this.startLoadingMessage(id);
            var containerDiv = $("#" + id);
            var childDivs = containerDiv.find("div.plugin_pagetree_children_container");

            childDivs.each(
                    function(index) {
                        var childId = AJS.pagetree.getIdFromElementName(this.id);
                        // check if last item before removing the loading message
                        AJS.pagetree.toggleChild(childId, mode, AJS.pagetree.MAX_DEPTH, index == childDivs.length - 1);
                    }
            );
        },

        /**
         * name would be in a format like "children393219-1" or "plusminus393219-1".
         * This function would just extract the "393219-1" part and return it.
         */
        getIdFromElementName : function(name) {
            if (!name || name == undefined) return null;

            if (name.indexOf("plusminus") != -1) return name.substring("plusminus".length);
            if (name.indexOf("children") != -1) return name.substring("children".length);
            return null;
        },

        /**
         * elementId would be in a format like "393219-1".
         * This function would just extract the "1" part and return it.
         */
        getTreeIdFromElementId : function(elementId) {
            if (!elementId || elementId == undefined) return null;

            // split the elementId and return the pageId
            return this.parseId(elementId)[1];
        },

        /**
         * elementId would be in a format like "393219-1".
         * This function would just return an array with format ["393219", "1"]
         */
        parseId : function(elementId) {
            if (!elementId || elementId == undefined) return null;

            // split the elementId and return the pageId
            return elementId.split("-");
        },

        startLoadingMessage : function(id) {
            var treeId = this.getTreeIdFromElementId(id);

            $("div.plugin_pagetree").each(
                    function(pagetreeId) {
                        if (pagetreeId == treeId) {
                            $(this).find("span.plugin_pagetree_status").removeClass("hidden");
                            $(this).find("div.plugin_pagetree_expandcollapse").addClass("hidden");
                        }
                    }
            );
        },

        finishLoadingMessage : function(id) {
            var treeId = this.getTreeIdFromElementId(id);

            $("div.plugin_pagetree").each(
                    function(pagetreeId) {
                        if (pagetreeId == treeId) {
                            $(this).find("span.plugin_pagetree_status").addClass("hidden");
                            $(this).find("div.plugin_pagetree_expandcollapse").removeClass("hidden");
                        }
                    }
            );
        },

        generateRequestString : function(treeId, pageId, ancestors, startDepth, spaceKey) {
            var reqString = this.treeRequests[treeId];

            if (pageId == "Orphan")
                reqString += "&hasRoot=false&spaceKey=" + spaceKey;
            else
                reqString += "&hasRoot=true&pageId=" + pageId;

            reqString += "&treeId=" + treeId + "&startDepth=" + startDepth;

            $.each(ancestors, function() {
                reqString += "&ancestors=" + this;
            });

            reqString = (AJS.params.serverUrl || "") + reqString;

            return reqString;
        },

        getPageTreeDiv : function(treeId) {
            var pagetreeId = treeId;
            var pagetreeDiv = null;

            $("div.plugin_pagetree").each(
                    function(index) {
                        if (index == pagetreeId)
                            pagetreeDiv = $(this);
                    }
            );

            return pagetreeDiv;
        },

        getPageTreeParams : function(pagetreeDiv) {
            var paramsFieldSet = pagetreeDiv.children("fieldset");
            var params = new Object();

            if (paramsFieldSet.length > 0) {
                paramsFieldSet.children("input").each(function() {
                    params[this.name] = this.value;
                });
            }

            return params;
        },

        getPageTreeAncestorIds : function(pagetreeDiv) {
            var paramsFieldSet = pagetreeDiv.children("fieldset");
            var ancestorIds = new Array();

            if (paramsFieldSet.length > 0) {
                var ancestorIdFieldset = paramsFieldSet.children("fieldset");
                if (ancestorIdFieldset.length > 0) {
                    ancestorIdFieldset.children("input").each(function() {
                        ancestorIds.push(this.value);
                    });
                }
            }

            return ancestorIds;
        },

        makePlusMinusButtonsClickable : function (pagetreeChildrenDiv) {
            pagetreeChildrenDiv.find("a.plugin_pagetree_childtoggle").each(
                    function() {
                        var jQueryThis = $(this);

                        jQueryThis.attr("href", "#");
                        jQueryThis.click(
                                function(e) {
                                    var childDiv = jQueryThis.parent().parent().children("div.plugin_pagetree_children_container");
                                    var childId = childDiv.attr("id");
                                    var id = childId.substring(8);

                                    AJS.pagetree.toggleChild(id);
                                    return AJS.stopEvent(e); /* Because we don't want to refresh the page */
                                }
                        );
                    }
            );
        },

        isChildrenHtml : function(html) {
            var testDiv = $(document.createElement("div"));

            testDiv.html(html);
            return testDiv.find("ul[id^='child_ul']").length;
        },

        loadChildren: function(rootPage, ancestorIds, startDepth, spaceKey, clearStatusMessage) {
            var _rootPage = rootPage;
            var _clearStatusMesssage = clearStatusMessage;
            var contextPath = this.getContextPath();
            var ids = this.parseId(rootPage);
            var pageId = ids[0];
            var treeId = ids[1];
            var pagetreeChildrenDiv = $("#children" + rootPage);
            var pagetreeParams = this.getPageTreeParams(this.getPageTreeDiv(treeId));

            pagetreeChildrenDiv.html("<ul>" + pagetreeParams["i18n-pagetree.loading"] + "</ul>");

            $.ajax({
                type : "GET",
                url :  this.generateRequestString(treeId, pageId, ancestorIds, startDepth, spaceKey),
                dataType : 'text',
                success : function(responseText) {
                    if (AJS.pagetree.isChildrenHtml(responseText)) {
                        pagetreeChildrenDiv.html(responseText);

                        // In IE, empty divs have height and it causes the UI to look like shit, which will be hidden by hideEmptyChildrenContainers() and unhidden here 
                        if (pagetreeChildrenDiv.children().length && pagetreeChildrenDiv.hasClass("hidden"))
                            pagetreeChildrenDiv.removeClass("hidden");

                        AJS.pagetree.makePlusMinusButtonsClickable(pagetreeChildrenDiv);

                        /* Make the + a - */
                        $("#plusminus" + _rootPage).addClass("icon-minus");
                        $("#plusminus" + _rootPage).removeClass("icon-plus");

                        /* Highlight target page if it exists */
                        $("#childrenspan" + AJS.pagetree.targetPages[parseInt(treeId)] + "-" + treeId).css("font-weight", "bold");

                        if (_clearStatusMesssage)
                            AJS.pagetree.finishLoadingMessage(_rootPage);

                        AJS.pagetree.hideEmptyChildrenContainers(pagetreeChildrenDiv);
                        if (AJS.PageGadget && AJS.PageGadget.contentsUpdated) {AJS.PageGadget.contentsUpdated();}
                    } else {
                        window.location = pagetreeParams["loginUrl"];
                    }
                },
                error : function(request) {
                    if (request.status == "403") {
                        // PGTR-76 - If current user doesn't has view permission to the root page, the page will keep refreshing. To fix that, we'll be displaying a message. 
                        pagetreeChildrenDiv.text(pagetreeParams["i18n-pagetree.error.permission"]);
                    } else {
                        pagetreeChildrenDiv.text(pagetreeParams["i18n-pagetree.error.general"]);
                    }
                }
            });
        },

        hideEmptyChildrenContainers : function(pagetreeChildrenDiv) {
            $("div.plugin_pagetree_children_container:empty", pagetreeChildrenDiv).addClass("hidden");
        },

        initPageTree: function(pagetreeDiv, pagetreeId) {
            var pagetreeParams = this.getPageTreeParams(pagetreeDiv);
            var noRoot = pagetreeParams["noRoot"] == "true";
            var rootPage =  noRoot ? "Orphan-" + pagetreeId : pagetreeParams["rootPageId"] + "-" + pagetreeId;

            this.treeRequests[pagetreeId] = pagetreeParams["treeRequestId"];
            this.targetPages[pagetreeId] = $("#pageId").attr("value");

            pagetreeDiv.children("fieldset").each(
                    function() {
                        var jQueryThis = $(this);

                        jQueryThis.children("input[treeId]").attr("value", pagetreeId);
                        jQueryThis.children("input[rootPage]").attr("value", rootPage);
                    }
            );

            if (noRoot) {
                pagetreeDiv.find("div.plugin_pagetree_children").attr("id", "childrenOrphan-" + pagetreeId);
                pagetreeDiv.find("a.plugin_pagetree_expandall").click(
                        function() {
                            AJS.pagetree.expandAll("childrenOrphan-" + pagetreeId);
                            return false;
                        }
                );
                pagetreeDiv.find("a.plugin_pagetree_collapseall").click(
                        function() {
                            AJS.pagetree.collapseAll("childrenOrphan-" + pagetreeId);
                            return false;
                        }
                );
            } else {
                pagetreeDiv.find("div.plugin_pagetree_children").attr("id", "children" + rootPage);
                pagetreeDiv.find("a.plugin_pagetree_expandall").click(
                        function() {
                            AJS.pagetree.expandAll("children" + rootPage);
                            return false;
                        }
                );
                pagetreeDiv.find("a.plugin_pagetree_collapseall").click(
                        function() {
                            AJS.pagetree.collapseAll("children" + rootPage);
                            return false;
                        }
                );
            }

            var pagetreeAncestorIds = this.getPageTreeAncestorIds(pagetreeDiv);
            this.loadChildren(
                    rootPage, pagetreeAncestorIds, pagetreeParams["startDepth"], pagetreeParams["spaceKey"]
            );
        },

        initPageTrees: function() {
            $("div.plugin_pagetree").each(function(pagetreeId) {
                AJS.pagetree.initPageTree($(this), pagetreeId);
            });
            this.avoidBeingFocusedByBodyLoadFunction();
        },

        // The placeFocus() function won't focus on fields belonging to the form 'inlinecommentform'
        avoidBeingFocusedByBodyLoadFunction : function() {
            var placeFocusFunction = self["placeFocus"];
            if (placeFocusFunction) {
                self["placeFocus"] = function() {
                    var pagetreeSearchForms = $("form[name='pagetreesearchform']");

                    pagetreeSearchForms.attr("name", "inlinecommentform");
                    placeFocusFunction();
                    pagetreeSearchForms.attr("name", "pagetreesearchform");
                };
            }
        }


    };

    AJS.pagetree.initPageTrees();
});
