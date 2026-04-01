/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("y12adqftnav1hgg");

  // Add group_id field to exercises collection
  collection.schema.addField({
    "system": false,
    "id": "xxgroupidx",
    "name": "group_id",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  });

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("y12adqftnav1hgg");

  // Remove group_id field
  collection.schema.removeField("xxgroupidx");

  return dao.saveCollection(collection);
});
