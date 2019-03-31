(function() {
    /* global $, browser */

    // Default settings
    var dictionarySettings = {
        theme: {
            value: "auto", //light/dark/auto
        },
    };

    function getDefinition(searchText, callback) {
        var definitionApi = "https://googledictionaryapi.eu-gb.mybluemix.net/?define=" + searchText;


    //definitionApi='http://thesaurus.altervista.org/thesaurus/v1?key=bzNYYKlfcaHmElZ6zMRQ&language=en_US&output=json&word=';

        var result = {
            searchText: searchText,
            definitions: "",
            pronounciation: "",
            status: "",
            synonyms: "",
        };

        $.when($.getJSON(definitionApi))
            .then(function(data) {
                result.pronounciation = data.phonetic;
                var synonyms = "";

                if(data && data.meaning){
                    var meaningList = data.meaning;
                    var index = 1;

                    for(var meaning in meaningList){
                        if(meaningList.hasOwnProperty(meaning)){

                            var meaningItem = meaningList[meaning][0];
                            console.log(meaningItem);

                            var syn = meaningItem.synonyms.join(', ');

                            synonyms += index+ ". (" + meaning + ") "+ syn;

                            if(index != Object.keys(meaningList).length){
                                synonyms += "<br />";
                            }


                        }
                        index++;
                    }

                    result.status = "success";
                    result.definitions = "";
                    result.synonyms = synonyms;
                }
            })
            .fail(function() {
                result.status = "fail";
            })
            .always(function() {
                callback(result);
            });
    }

    browser.runtime.onMessage.addListener(function(msg) {
        localStorage.setItem("recentSearchText", msg.searchText);
        getDefinition(msg.searchText, sendResponse);
    });

    function sendResponse(result) {
        var response = {
            db: dictionarySettings,
            search: result,
        };
        browser.tabs
            .query({
                currentWindow: true,
                active: true,
            })
            .then(function(tabs) {
                browser.tabs.sendMessage(tabs[0].id, response);
            });
    }

    function logError(err) {
        console.error(err);
    }

    function updateSettings(dbData) {
        dbData = dbData || {};
        dictionarySettings = $.extend(dictionarySettings, dbData);
    }

    browser.storage.onChanged.addListener(function(changes, area) {
        if (area === "sync") {
            browser.storage.sync.get().then(updateSettings, logError);
        }
    });
    browser.storage.sync.get().then(updateSettings, logError);
})();
