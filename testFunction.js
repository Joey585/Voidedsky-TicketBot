function stringTest(string){

    const regexp = new RegExp('<@\d+>','g');
    const matches = string.matchAll(regexp);

    for (const match of matches) {
        console.log(`Found ${match[0]} start=${match.index} end=${match.index + match[0].length}.`);
    }
// expected output: "Found football start=6 end=14."
// expected output: "Found foosball start=16 end=24."

// matches iterator is exhausted after the for..of iteration
// Call matchAll again to create a new iterator
    Array.from(string.matchAll(regexp), (m) => m[0]);
// Array [ "football", "foosball" ]

}

module.exports = { stringTest }