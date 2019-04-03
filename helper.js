export { queryPrefix, formatResponse }

const queryPrefix = "https://www.google.com/search?q=define+";

function formatResponse(result) {
    result.googleQuery = queryPrefix + result.searchText;

    if (result.status === "fail") {
        result.definitions = "No definition found";
        result.pronounciation = "";
        return result;
    }

    return result;
}