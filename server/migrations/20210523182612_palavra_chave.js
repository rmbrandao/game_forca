exports.up = function(knex) {
    return knex.schema.createTable('palavra_chave', function (table) {
        table.increments();
        table.string('palavra');
        table.integer('tamanho');
    })
};

exports.down = function(knex) {
    return knex.schema
    .dropTable("palavra_chave")
};