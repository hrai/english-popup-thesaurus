(function () {
    // Default settings
    var dictionarySettings = {
        theme: {
            value: "auto", //light/dark/auto
        },
    };

    function getDefinition(data, callback) {
        var searchText = data.searchText;
        var definitionApi =
            "https://api.dictionaryapi.dev/api/v2/entries/en/" + searchText;

        var result = {
            searchText: searchText,
            definitions: "",
            pronunciation: "",
            status: "",
            synonyms: "",
        };

        $.ajax({
            url: definitionApi,
            crossDomain: true,
            dataType: "json",
            success: function (data) {
                if (!data) return;

                var content = data[0];

                var phonetics = content.phonetics;
                if (Array.isArray(phonetics) && phonetics.length) {
                    result.pronunciation = phonetics[0].text;
                }

                var synonyms = "";

                if (content && content.meanings) {
                    var meaningList = content.meanings;
                    var index = 1;

                    meaningList.forEach(function (meaning) {
                        var defs = meaning.definitions;

                        defs.forEach(function (definition) {
                            if ("synonyms" in definition) {
                                var synonymsArr = definition.synonyms;

                                if (synonymsArr) {
                                    var syn = synonymsArr.join(", ");

                                    synonyms +=
                                        index +
                                        ". (" +
                                        meaning.partOfSpeech +
                                        ") " +
                                        syn +
                                        "<br/>";
                                }

                                index++;
                            }
                        });
                    });
                }

                result.synonyms = getSynonyms(synonyms);
                callback(result);
            },
            error: function (xhr, textStatus) {
                result.status = "fail";
                callback(result);
            },
        });
    }

    browser.runtime.onMessage.addListener(function (data) {
        setLocalStorageItem(data);
        getDefinition(data, sendResponse);
    });

    function setLocalStorageItem(data) {
        localStorage.setItem("recentSearchText", data.searchText);
    }

    function getSynonyms(synonyms) {
        if (synonyms === "") {
            return "No synonyms found";
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
            .then(function (tabs) {
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

    browser.storage.onChanged.addListener(function (changes, area) {
        if (area === "sync") {
            browser.storage.sync.get().then(updateSettings, logError);
        }
    });

    browser.storage.sync.get().then(updateSettings, logError);
})();
