# JSON schema documenter

The JSON schema documeter is an [AngularJS](https://angularjs.org/) web application that supports the visualization of [JSON schemas](https://json-schema.org/) (draft-4).

A live version of the JSONSchema-documenter is available at: https://fairsharing.github.io/JSONSchema-documenter/. By default, it will load the [DAta Tag Suite (DATS)](https://github.com/datatagsuite) [study schema](https://w3id.org/dats/schema/study_schema.json).

To customize the application to visualize other schemas, include the following JSON string as "parameters" in the URL:

{
    "target":"the URL where the live schema",
    "display":"one of the options between grid or table"
}

You can pass it to the URL 'parameters' variable as such:
https://fairsharing.github.io/JSONSchema-documenter/index.html?parameters={"target":"https://w3id.org/dats/schema/study_schema.json","display":"grid"}


## License

This code is provided under [BSD 3-Clause License](https://github.com/FAIRsharing/JSONSchema-documenter/blob/master/LICENSE)