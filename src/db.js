const mongo = require("mongodb").MongoClient;
const dsn =  process.env.CHAT_DSN || "mongodb://localhost:27017/chat";



async function findInCollection(colName, criteria, projection, limit) {
    const client  = await mongo.connect(dsn, { useNewUrlParser: true });
    const db = await client.db();
    const col = await db.collection(colName);
    const res = await col.find(criteria, projection).limit(limit).toArray();

    await client.close();
    return res;
}


async function saveToCollection(colName, data) {
    const client = await mongo.connect(dsn, { useNewUrlParser: true });
    const db = await client.db();
    const col = await db.collection(colName);

    try {
        await col.drop();
    } catch (err) {
        console.log(err);
    }

    await col.insertMany(data);
    await client.close();
}





module.exports = {
    findInCollection,
    saveToCollection
}
