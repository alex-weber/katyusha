module.exports = "query getCards($language: String, $offset: Int, $nationIds: [Int], $kredits: [Int], $q: String, $type: [String], $rarity: [String], $set: [String], $showSpawnables: Boolean) {\n  cards(language: $language, first: 20, offset: $offset, nationIds: $nationIds, kredits: $kredits, q: $q, type: $type, set: $set, rarity: $rarity, showSpawnables: $showSpawnables) {\n    pageInfo {\n      count\n      hasNextPage\n      __typename\n    }\n    edges {\n      node {\n        id\n        cardId\n        importId\n        json\n        imageUrl: image(language: $language)\n        thumbUrl: image(type: thumb, language: $language)\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"

//this query is copied from kards.com
