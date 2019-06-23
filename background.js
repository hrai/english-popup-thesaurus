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

        var result = {
            searchText: searchText,
            definitions: "",
            pronounciation: "",
            status: "",
            synonyms: "",
        };

        $.when($.getJSON(definitionApi))
            .then(function(data) {
                if(!data)
                    return;
                
                var content = data[0];
                result.pronounciation = content.phonetic;
                var synonyms = "";

                if(content && content.meaning){
                    var meaningList = content.meaning;
                    var index = 1;

                    for(var meaning in meaningList){
                        if(meaningList.hasOwnProperty(meaning)){

                            var meaningItem = meaningList[meaning][0];
                            var synonymsArr = meaningItem.synonyms;

                            if(synonymsArr) {
                                var syn = synonymsArr.join(', ');

                                synonyms += index+ ". (" + meaning + ") "+ syn;

                                if(index != Object.keys(meaningList).length){
                                    synonyms += "<br />";
                                }
                            }
                        }
                        index++;
                    }

                    result.status = "success";
                    result.definitions = "";
                    result.synonyms = getSynonyms(synonyms);
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

    function getSynonyms(synonyms) {
        if(synonyms === '') {
            return 'No synonyms found';
        }

        return synonyms;
    }

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
