# JSON schema documenter

The JSON schema documeter is an [AngularJS](https://angularjs.org/) web application that supports the visualization of [JSON schemas](https://json-schema.org/) (draft-4).

A live version of the JSONSchema-documenter is available at: https://fairsharing.github.io/JSONschema-documenter/. By default, it will load the [DAta Tag Suite (DATS)](https://github.com/datatagsuite) [study schema](https://w3id.org/dats/schema/study_schema.json).

To customize the application to visualize other schemas, you can use two parameters:
- ```schema_url``` is the URL to the main JSON schema of a network of schemas (this is required, by default, we use the [DATS.study schema](https://w3id.org/dats/schema/study_schema.json))
- ```context_mapping_url``` is the URL to a file that maps each schema to a context file (this is optional)


These parameters are set in the web application URL, for example:

https://fairsharing.github.io/JSONschema-documenter/index.html?schema_url=https://w3id.org/dats/schema/study_schema.json

If you have a mapping file of your JSON-LD context files, you can also pass it as a parameter. For example:

https://fairsharing.github.io/JSONschema-documenter/index.html?schema_url=https://w3id.org/dats/schema/study_schema.json&context_mapping_url=schemas/dats_mapping.json


## License

This code is provided under [BSD 3-Clause License](https://github.com/FAIRsharing/JSONschema-documenter/blob/master/LICENSE)

## Contact

- [Dominique Batista](http://github.com/terazus)
- [Alejandra Gonzalez-Beltran](http://github.com/agbeltran)
