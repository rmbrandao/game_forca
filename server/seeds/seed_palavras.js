
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('palavra_chave').del()
    .then(function () {
      // Inserts seed entries
      return knex('palavra_chave').insert([
        { palavra: 'POROROCA', tamanho: 'POROROCA'.length },
        { palavra: 'LIMONADA', tamanho: 'LIMONADA'.length },
        { palavra: 'ARDILOSO', tamanho: 'ARDILOSO'.length },
        { palavra: 'CATAPORA', tamanho: 'CATAPORA'.length },
        { palavra: 'EMPENHADO', tamanho: 'EMPENHADO'.length },
        { palavra: 'ABOBRINHA', tamanho: 'ABOBRINHA'.length },
        { palavra: 'PNEUMONIA', tamanho: 'PNEUMONIA'.length },
        { palavra: 'SERENATA', tamanho: 'SERENATA'.length }
      ]);
    });
};

