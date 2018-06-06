
Installation
============

Testing json-schema directive

.. jsonschema::

    {
        "$schema": "This field is ignored for now. Perhaps use it to indicate schema version in display?",
        "title": "Test data set 1: **Simple type**",
        "id": "http://this.better.be.a.regular.domain",
        "description": "These data sets exercise `JSON Schema <http://json-schema.org>`_ constructions and show how they are rendered.\n\nNote that it is possible to embed reStructuredText elements in strings.",
        "type": "string",
        "minLength": 10,
        "maxLength": 100,
        "pattern": "^[A-Z]+$"
    }
