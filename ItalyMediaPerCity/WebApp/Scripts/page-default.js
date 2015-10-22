(function () {

    function DefaultPage() {
        Page.call(this, "page-default");
        this._window_onResizeFunc = null;
        this._window_prevWidth = 0;
        this._window_prevHeight = 0;
        this._headerTitleElement = null;
        this._headerTitleElement_noWrapPaddingTop = 0/0;
        this._headerTitleElement_wrapPaddingTop = 24;
    }
    DefaultPage.prototype = Object.create(Page.prototype, {
        _onFirstShow: {
            value: function (paramsPojo) {

                this._headerTitleElement = htmlElem_get(".header-title", this.htmlElement);
                this._headerTitleElement_noWrapPaddingTop = this._getHeaderTitleElement_paddingTopPixels();

                this._window_prevWidth = window.innerWidth;
                this._window_prevHeight = window.innerHeight;
                this._window_onResizeFunc = this._window_onResize.bind(this);
                addEventListener("resize", this._window_onResizeFunc, false);


                this._updateScriptedLayout();



                htmlElem_get("#sign-out", this.htmlElement).onclick = this._signOutBtn_onClick.bind(this);

                PageMgr.instance.addListener("propertyChanged", this._pageMgrInstance_propChanged, this);
                

            }
        },

        _signOutBtn_onClick: {
            value: function () {
                var req;
                req = new HttpRequest({
                    url: "DefaultHandler.ashx?action=signOut",
                    method: "POST"
                });
                req.addListener("completed", this._signOutReq_completed, this);
                req.send();
            }
        },

        _signOutReq_completed: {
            value: function (result, statusCode) {
                if (statusCode === 200) {
                    PageMgr.instance.userAuthorization = null;
                } else {
                    alert("An unknown error occured, please try again later.");
                }
            }
        },

        _pageMgrInstance_propChanged: {
            value: function (propName) {
                if (propName === "userAuthorization") {
                    this._updateSignInOutBtns();
                }
            }
        },

        _updateSignInOutBtns: {
            value: function () {
                var signInBtn = htmlElem_get("#sign-in", this.htmlElement);
                var signOutBtn = htmlElem_get("#sign-out", this.htmlElement);
                var welcomeMsg = htmlElem_get("#welcome-msg", this.htmlElement);
                var flag;
                if (PageMgr.instance.userAuthorization != null) {
                    flag = false;
                } else {
                    flag = true;
                }
                elem_display(signInBtn, flag);
                elem_display(signOutBtn, !flag);
                elem_display(welcomeMsg, !flag);
            }
        },

        _getHeaderTitleElement_paddingTopPixels: {
            value: function () {
                var t, pt;
                t = this._headerTitleElement;
                pt = getComputedStyle(t, null).getPropertyValue("padding-top");
                assert(/^\d+px$/.test(pt));
                pt = parseInt(pt);
                return pt;
            }
        },
        _updateScriptedLayout: {
            value: function () {
                /*
                var t;
                var pt = this._getHeaderTitleElement_paddingTopPixels();
                t = this._headerTitleElement.offsetHeight - pt;
                if (t > 100) {
                    if (pt > this._headerTitleElement_wrapPaddingTop) {
                        this._headerTitleElement.style.paddingTop = this._headerTitleElement_wrapPaddingTop + "px";
                    }
                } else {
                    this._headerTitleElement.style.paddingTop = "";
                }
                */
            }
        },
        _window_onResize: {
            value: function () {
                var w, h;
                w = innerWidth;
                h = innerHeight;
                if (this._window_prevWidth === w && this._window_prevHeight === h) {
                    return;
                }
                this._window_prevWidth = w;
                this._window_prevHeight = h;
                this._updateScriptedLayout();
            }
        }

    });

    PageMgr.instance.registerPage(new DefaultPage());

})();