import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface NoteDetaillee {
  type: 'quiz' | 'etude_cas';
  titre: string;
  note: number;
  note_max: number;
  date: string;
}

interface ReleveNote {
  bloc_id: number;
  numero_bloc: number;
  titre: string;
  moyenne_etudiant: number;
  moyenne_promo: number;
  meilleure_moyenne_promo: number;
  notes_detaillees?: NoteDetaillee[];
}

interface MoyennesGenerales {
  moyenne_etudiant: number;
  moyenne_promo: number;
  meilleure_moyenne_promo: number;
}

interface ReleveNotesPDFProps {
  releve: ReleveNote[];
  moyennesGenerales: MoyennesGenerales | null;
  userName: string;
}

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#F8F5E4',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'right',
  },
  userName: {
    fontSize: 12,
    color: '#032622',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#032622',
    textAlign: 'center',
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  table: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#032622',
    backgroundColor: '#E8F5E9',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#032622',
    color: '#F8F5E4',
    padding: 12,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#032622',
    padding: 12,
    minHeight: 50,
  },
  tableRowGeneral: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: '#032622',
    backgroundColor: '#032622',
    opacity: 0.1,
    padding: 12,
    fontWeight: 'bold',
  },
  notesDetaillees: {
    marginTop: 8,
    paddingLeft: 20,
  },
  noteDetaillee: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 8,
  },
  noteDetailleeType: {
    width: 60,
    fontSize: 8,
    color: '#032622',
    opacity: 0.7,
  },
  noteDetailleeTitre: {
    flex: 1,
    fontSize: 8,
    color: '#032622',
    opacity: 0.8,
  },
  noteDetailleeNote: {
    width: 40,
    fontSize: 8,
    color: '#032622',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: '#032622',
  },
  tableCellBloc: {
    flex: 1,
    fontSize: 10,
    color: '#032622',
  },
  blocNumber: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  blocTitle: {
    fontSize: 9,
    color: '#032622',
    opacity: 0.8,
  },
  tableCellNote: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#032622',
    textAlign: 'center',
  },
  tableCellNoteGeneral: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#032622',
    textAlign: 'center',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#032622',
  },
  exportDate: {
    fontSize: 9,
    color: '#032622',
    textAlign: 'center',
    opacity: 0.7,
  },
});

const formatNote = (note: number): string => {
  if (note === 0) return '0';
  return note.toFixed(1).replace('.', ',');
};

export const ReleveNotesPDF: React.FC<ReleveNotesPDFProps> = ({
  releve,
  moyennesGenerales,
  userName,
}) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header avec nom */}
        <View style={styles.header}>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        {/* Titre */}
        <Text style={styles.title}>RELEVÉ DE NOTES</Text>

        {/* Tableau */}
        <View style={styles.table}>
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>
              BLOCS DE COMPÉTENCES
            </Text>
            <Text style={styles.tableHeaderCell}>
              MOYENNE DE L'ÉTUDIANT
            </Text>
            <Text style={styles.tableHeaderCell}>
              MOYENNE DE LA PROMO
            </Text>
            <Text style={styles.tableHeaderCell}>
              MEILLEURE MOYENNE DE LA PROMO
            </Text>
          </View>

          {/* Lignes des blocs */}
          {releve.map((bloc) => (
            <View key={bloc.bloc_id}>
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { flex: 2 }]}>
                  <Text style={styles.blocNumber}>BLOC {bloc.numero_bloc}</Text>
                  <Text style={styles.blocTitle}>{bloc.titre}</Text>
                </View>
                <View style={styles.tableCellNote}>
                  <Text>{formatNote(bloc.moyenne_etudiant)}</Text>
                </View>
                <View style={styles.tableCellNote}>
                  <Text>{formatNote(bloc.moyenne_promo)}</Text>
                </View>
                <View style={styles.tableCellNote}>
                  <Text>{formatNote(bloc.meilleure_moyenne_promo)}</Text>
                </View>
              </View>
              
              {/* Notes détaillées (quiz et études de cas) */}
              {bloc.notes_detaillees && bloc.notes_detaillees.length > 0 && (
                <View style={[styles.tableRow, { backgroundColor: '#F8F5E4', paddingTop: 8, paddingBottom: 8 }]}>
                  <View style={[styles.tableCell, { flex: 2 }]}>
                    <View style={styles.notesDetaillees}>
                      {bloc.notes_detaillees.map((note, index) => (
                        <View key={index} style={styles.noteDetaillee}>
                          <Text style={styles.noteDetailleeType}>
                            {note.type === 'quiz' ? 'Quiz:' : 'Étude:'}
                          </Text>
                          <Text style={styles.noteDetailleeTitre}>{note.titre}</Text>
                          <Text style={styles.noteDetailleeNote}>{formatNote(note.note)}/20</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.tableCellNote}></View>
                  <View style={styles.tableCellNote}></View>
                  <View style={styles.tableCellNote}></View>
                </View>
              )}
            </View>
          ))}

          {/* Ligne des moyennes générales */}
          {moyennesGenerales && (
            <View style={styles.tableRowGeneral}>
              <View style={[styles.tableCell, { flex: 2 }]}>
                <Text style={styles.blocNumber}>MOYENNES GÉNÉRALES</Text>
              </View>
              <View style={styles.tableCellNoteGeneral}>
                <Text>{formatNote(moyennesGenerales.moyenne_etudiant)}</Text>
              </View>
              <View style={styles.tableCellNoteGeneral}>
                <Text>{formatNote(moyennesGenerales.moyenne_promo)}</Text>
              </View>
              <View style={styles.tableCellNoteGeneral}>
                <Text>{formatNote(moyennesGenerales.meilleure_moyenne_promo)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer avec date */}
        <View style={styles.footer}>
          <Text style={styles.exportDate}>
            Document généré le {currentDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

