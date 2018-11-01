/* globals hopscotch: false */

/* ============ */
/* EXAMPLE TOUR */
/* ============ */
var tour = {
    id: 'hello-hopscotch',
    steps: [
        {
            target: '#pageTop', //specify the element
            placement: 'bottom', //placement for the popover
            title: "Welcome to the JSONschema-documenter!",
            content: 'This web app will help you document and navigate through sets of JSON schemas, starting with a root schema', // content to display,
            arrowOffset: 60,
            yOffset: -80,
            xOffset: 40
        },
        {
            target: '#settingButton',
            placement: 'right',
            title: "This is the settings button",
            content: ' From this menu, you can load the root schema of a network of JSON schemas. If you also have JSON-LD context files associated with the JSON schemas, you can add the URL to a mapping file matching the JSON schmeas to JSON-LD context files, and visualize the semantic annotations',
            yOffset: -30
        },
        {
            target: '#legend',
            placement: 'left',
            title: "This is the legend button",
            content: 'This menu allows you to see the color coding we use for the cards: green cards for required properties, blue cards for non-required ones',
            yOffset: -30

        },
        {
            target: '#schemaMenu',
            placement: 'bottom',
            title: "This is the main menu button",
            content: 'This menu allows you to display all the loaded schemas, and each schema name links to its visualization.'
        },
        {
            target: '#study_schema',
            placement: 'left',
            title: "This is the root schema",
            content: 'This section shows the root schema metadata and its properties, including links to other referenced schemas when relevant'
        },
        {
            target: "#study_schema .titleText",
            placement: 'bottom',
            title: "This is the root schema title",
            content: 'Each schema section will start with a title like this one.' // content to display
        },
        {
            target: '#study_schema .fa-file-alt', //specify the element
            placement: 'right', //placement for the popover
            title: "Display JSON schema icon",
            content: 'By clicking this icon, you can display the underlying JSON schema and copy it to the clipboard if you wish.', // content to display
            yOffset: -20
        },
        {
            target: "#study_schema .metadata",
            placement: 'top', //placement for the popover
            title: "This is the root schema metadata",
            content: "This section shows all the metadata attached to a schema, such as schema version, the schema 'id', its description, and so on." // content to display
        },
        {
            target: "#study_schema .schemaProperties",
            placement: 'top', //placement for the popover
            title: "These are the properties of the root schema",
            content: "This displays the schema properties, their cardinality and types. Required properties are displayed in green, and non-required properties in blue." // content to display
        },
        {
            target: "#study_schema_identifier",
            placement: 'right', //placement for the popover
            title: "This is a non-required property (displayed in blue)",
            content: "This card display all the characteristics of the property: its name, its description, expected types (in this case referencing other schema) and cardinality." // content to display
        },
        {
            target: "#study_schema_name",
            title: "This is a required property (displayed in green)",
            placement: 'right', //placement for the popover
            content: "This card display all the characteristics of the property: its name, its description, expected types (in this case referencing other schema) and cardinality." // content to display
        },
        {
            target: "#study_schema_identifier .referenceLink",
            placement: 'right', //placement for the popover
            title: "This is reference that points to another item",
            content: "It can point to a definition within the same schema, a sub-schema, or an external schema." // content to display
        },
        {
            target: "#backToTop",
            placement: 'top', //placement for the popover
            title: "This is the back to top arrow",
            content: "It allows you to go back to the top of the page when you are exploring the schemas. Thanks for visiting the tour!" // content to display
        }
    ],
    showPrevButton: true,
    scrollTopMargin: 100
};