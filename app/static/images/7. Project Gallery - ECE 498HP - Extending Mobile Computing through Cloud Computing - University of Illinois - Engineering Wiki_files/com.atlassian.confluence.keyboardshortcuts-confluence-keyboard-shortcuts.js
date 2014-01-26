AJS.toInit(function($) {

//// CGP-151/CONFDEV-811 - Skip this if you are in the Page Gadget
if (AJS.PageGadget || (window.parent.AJS && window.parent.AJS.PageGadget)) {
    AJS.log("Inside the Page Gadget. Skipping keyboard shortcuts");
    return;
}

Confluence.KeyboardShortcuts.enabled = (AJS.Data.get("use-keyboard-shortcuts") === "true");

AJS.bind("shortcuts-loaded.keyboardshortcuts", function (e, data) {

    var dialog;
    $("#keyboard-shortcuts-link").click(function () {
        if (!dialog) {
            Confluence.KeyboardShortcuts.makeDialog(data.shortcuts, function(popup) {
                dialog = popup;
                dialog.show();
            });
        } else {
            dialog.show();
        }
        return false;
    });
});

AJS.bind("register-contexts.keyboardshortcuts", function(e, data){    
    $ = AJS.$;  // HACK - the $ from above isn't in scope here. Why? No idea, moving along.

    // Only bind the shortcuts for contexts if the user has the preference set
    if (Confluence.KeyboardShortcuts.enabled) {
    // Here we bind to register-contexts.keyboardshortcuts so that we can select which
    // keyboard shortcut contexts should be enabled. We use jQuery selectors to determine
    // which keyboard shortcut contexts are applicable to a page.

        var shortcutRegistry = data.shortcutRegistry;
        shortcutRegistry.enableContext("global");
        $("#action-menu-link").length && shortcutRegistry.enableContext("viewcontent");
        $("#viewPageLink").length && shortcutRegistry.enableContext("viewinfo");
        Confluence.KeyboardShortcuts.ready = true;
    }
});

// AKS requires that we load the I18n resources before we ask to initialize the keyboard shortcuts
AJS.I18n.get("com.atlassian.confluence.keyboardshortcuts", function() {
    AJS.trigger("initialize.keyboardshortcuts");
}, function() {
    AJS.log("There was an error loading the keyboard shortcuts, please try again");
});


});

window.Confluence = window.Confluence || {};

// Add functions that are referenced from the execute shortcut operations in atlassian-plugin.xml here
Confluence.KeyboardShortcuts = {
    enabled: false,
    ready: false
};

Confluence.KeyboardShortcuts.makeDialog = function (shortcuts, callback) {
    var $ = AJS.$,
    popup,

    cancel = function() {
        AJS.log("Hiding Shortcuts help");
        popup.hide();
    },

    //Same technique as tinyMCE.
    isMac = navigator.platform.indexOf('Mac') != -1,

    getText = function (key) {
        return AJS.I18n.getText('keyboard.shortcuts.dialog.' + key);
    },

    //Construct the key sequence diagram shown on the keyboard shortcuts help dialog
    //e.g. shortcut.keys = [["g", "d"]]
    makeKeySequence = function (shortcut) {
        var sequenceSpan = AJS("span");
        // TODO - may need "or" in future if keys has length > 1
        var keySequence = shortcut.keys[0];
        
        for(var i = 0; i < keySequence.length; i++) {
            if(i > 0)
                sequenceSpan.append(makeKbdSeparator(AJS.I18n.getText("keyboard.shortcut.then")));

            makeKeyCombo(keySequence[i], sequenceSpan);
        }
        
        return sequenceSpan;
    },

    makeKeyCombo = function(combo, sequence) {
        var keys = combo.split("+");

        for (var i = 0; i < keys.length; i++) {
            if (i > 0)
                sequence.append(makeKbdSeparator("+"));

            makeKeyAlternatives(keys[i], sequence);
        }
    },

    makeKeyAlternatives = function(key, sequence) {
        var keys = key.split("..");
        
        for (var i = 0; i < keys.length; i++) {
            if (i > 0)
                sequence.append(makeKbdSeparator(AJS.I18n.getText("keyboard.shortcut.to")));
        
            sequence.append(makeKbd(keys[i]));
        }
    },

    makeKbd = function(key) {
        var kbd = AJS("kbd");

        switch (key){
            case "Sh":
                kbd.text(AJS.I18n.getText("keyboard.shortcut.shift"));
                kbd.addClass("modifier-key");
                break;
            case "Ctrl":
                var text = isMac ? '\u2318' : AJS.I18n.getText("keyboard.shortcut.ctrl");  //Apple command key
                kbd.text(text);                    
                kbd.addClass("modifier-key");
                break;
            case "Tab":
                kbd.text(AJS.I18n.getText("keyboard.shortcut.tab"));
                kbd.addClass("modifier-key");
                break;
            case "Alt":
                kbd.text(AJS.I18n.getText("keyboard.shortcut.alt"));
                kbd.addClass("modifier-key");
                break;
            default:
                kbd.text(key);
                kbd.addClass("regular-key");
        }

        return kbd;
    },

    makeKbdSeparator = function(text) {
        var separator = AJS("span");
        separator.text(text);
        separator.addClass("key-separator");
        return separator;
    },

    makeShortcutModule = function(titleKey, contexts, shortcuts) {
        var module = $(AJS.renderTemplate("keyboard-shortcut-module", getText(titleKey)));
        var list = module.find("ul");

        for (var i = 0; i < shortcuts.length; i++) {
            var shortcut = shortcuts[i];
            if($.inArray(shortcut.context, contexts) != -1) {
                var shortcutItem = AJS("li");
                var desc = AJS("strong").append(AJS.I18n.getText(shortcut.descKey));
                shortcutItem.append(desc);
                shortcutItem.append(makeKeySequence(shortcut));
                list.append(shortcutItem);
            }
        }

        return module;
    },

    makeGeneralShortcutsMenu = function() {
        var generalShortcutsMenuPane = $(AJS.renderTemplate("keyboard-shortcut-menu", "general-shortcuts-menu"));
        var generalShortcutsMenu = $(generalShortcutsMenuPane).children(".shortcutsmenu");

        if (AJS.Data.get("remote-user")) {
            generalShortcutsMenuPane.append(AJS.renderTemplate("keyboard-shortcut-enabled-checkbox"));
        }
        generalShortcutsMenuPane.append(generalShortcutsMenu);

        generalShortcutsMenu.append(makeShortcutModule("module.global", ["global"], shortcuts));
        generalShortcutsMenu.append(makeShortcutModule("module.page", ["viewcontent", "viewinfo"], shortcuts));

        return generalShortcutsMenuPane;
    },

    makeEditorShortcutsMenu = function() {
        var shortcuts = Confluence.KeyboardShortcuts.Editor;
        var editorShortcutsMenuPane = $(AJS.renderTemplate("keyboard-shortcut-menu", "editor-shortcuts-menu"));
        var editorShortcutsMenu = $(editorShortcutsMenuPane).children(".shortcutsmenu");

        editorShortcutsMenuPane.append(editorShortcutsMenu);

        editorShortcutsMenu.append(makeShortcutModule("module.block", ["editor.block"], shortcuts));
        editorShortcutsMenu.append(makeShortcutModule("module.rich", ["editor.rich"], shortcuts));
        editorShortcutsMenu.append(makeShortcutModule("module.autocomplete", ["editor.autocomplete"], shortcuts));
        editorShortcutsMenu.append(makeShortcutModule("module.editing-actions", ["editor.actions"], shortcuts));

        if (AJS.Data.get("remote-user")) {
            editorShortcutsMenuPane.append(AJS.renderTemplate("keyboard-shortcut-editor-description",
                AJS.Confluence.getContextPath() + "/users/viewmyeditorsettings.action"));
        }

        return editorShortcutsMenuPane;
    },

    toggleEnabled = function (event) {
        var enable = $(this).attr('checked');
        // TODO - after 3.4-m4 and blitz - error handling architecture
        AJS.$.post(AJS.Confluence.getContextPath() + "/rest/confluenceshortcuts/latest/enabled", {enabled: enable}, function(){
            Confluence.KeyboardShortcuts.enabled = enable;
            Confluence.KeyboardShortcuts.ready = false;
            if (enable) {
                AJS.trigger("add-bindings.keyboardshortcuts");
            } else {
                AJS.trigger("remove-bindings.keyboardshortcuts");
            }
        });
    },

    initialiseEnableShortcutsCheckbox = function () {
        $('#keyboard-shortcut-enabled-checkbox')
            .attr('checked', Confluence.KeyboardShortcuts.enabled)
            .click(toggleEnabled);
    },

    url = AJS.Data.get("static-resource-url-prefix") + "/plugins/keyboardshortcuts/help-dialog.action";

    AJS.loadTemplatesFromUrl(url, function () {
        var editorShortcutsMenu = $("<div id='shortcutsmenu'>");

        popup = AJS.ConfluenceDialog({
            width: 950,
            height: 590,
            id: "keyboard-shortcuts-dialog"
        });

        popup.addHeader(AJS.I18n.getText("keyboard.shortcuts.dialog.heading"));
        popup.addPanel(getText("panel.general"), makeGeneralShortcutsMenu());
        popup.addPanel(getText("panel.editor"), makeEditorShortcutsMenu());
        popup.addButton("keyboard.shortcuts.dialog.close", cancel, "keyboard-shortcuts-close-button");
        popup.popup.element.find(".dialog-button-panel").append(AJS.renderTemplate("keyboard-shortcut-help-list"));

        // If you have an editor active, automatically open the Editor tab.
        if (typeof(tinyMCE) != "undefined" && tinyMCE.activeEditor) {
            popup.gotoPanel(1);
        } else {
            popup.gotoPanel(0);
        }

        callback(popup);
        initialiseEnableShortcutsCheckbox();
    });
};

Confluence.KeyboardShortcuts.Editor = [
    {
        context: "editor.block",
        descKey: "keyboard.shortcuts.editor.block.headings",
        keys: [["Ctrl+Alt+1..6"]]
    },
    {
        context: "editor.block",
        descKey: "keyboard.shortcuts.editor.block.noformat",
        keys: [["Ctrl+7"]]
    },
    {
        context: "editor.block",
        descKey: "keyboard.shortcuts.editor.block.quote",
        keys: [["Ctrl+Alt+q"]]
    },
    {
        context: "editor.block",
        descKey: "keyboard.shortcuts.editor.block.list.bullet",
        keys: [["Ctrl+Sh+b"]]
    },
    {
        context: "editor.block",
        descKey: "keyboard.shortcuts.editor.block.list.numbered",
        keys: [["Ctrl+Sh+n"]]
    },
    {
        context: "editor.block",
        descKey: "keyboard.shortcuts.editor.block.list.indent",
        keys: [["Tab"]]
    },
    {
        context: "editor.block",
        descKey: "keyboard.shortcuts.editor.block.list.outdent",
        keys: [["Sh+Tab"]]
    },
    {
        context: "editor.rich",
        descKey: "keyboard.shortcuts.editor.rich.link",
        keys: [["Ctrl+k"]]
    },
    {
        context: "editor.rich",
        descKey: "keyboard.shortcuts.editor.rich.image",
        keys: [["Ctrl+m"]]
    },
    {
        context: "editor.rich",
        descKey: "keyboard.shortcuts.editor.rich.macro",
        keys: [["Ctrl+Sh+a"]]
    },
    {
        context: "editor.rich",
        descKey: "keyboard.shortcuts.editor.rich.table",
        keys: [["Ctrl+Sh+i"]]
    },
    {
        context: "editor.rich",
        descKey: "keyboard.shortcuts.editor.rich.table.row.copy",
        keys: [["Ctrl+Sh+c"]]
    },
    {
        context: "editor.rich",
        descKey: "keyboard.shortcuts.editor.rich.table.row.cut",
        keys: [["Ctrl+Sh+x"]]
    },
    {
        context: "editor.rich",
        descKey: "keyboard.shortcuts.editor.rich.table.row.paste",
        keys: [["Ctrl+Sh+v"]]
    },
    {
        context: "editor.autocomplete",
        descKey: "keyboard.shortcuts.editor.autocomplete.link",
        keys: [["["]]
    },
    {
        context: "editor.autocomplete",
        descKey: "keyboard.shortcuts.editor.autocomplete.image",
        keys: [["!"]]
    },
    {
        context: "editor.autocomplete",
        descKey: "keyboard.shortcuts.editor.autocomplete.macro",
        keys: [["{"]]
    },
    {
        context: "editor.actions",
        descKey: "keyboard.shortcuts.editor.actions.save",
        keys: [["Ctrl+s"]]
    },
    {
        context: "editor.actions",
        descKey: "keyboard.shortcuts.editor.actions.fullscreen",
        keys: [["Ctrl+Sh+f"]]
    }
];

