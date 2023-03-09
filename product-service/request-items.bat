$ echo yes
$ aws dynamodb batch-write-item --request-items file://request-items.json --return-consumed-capacity INDEXES --return-item-collection-metrics SIZE
$ echo no