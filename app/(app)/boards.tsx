import { Text, View } from 'react-native';

export default function BoardsPage() {
  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 26, fontWeight: '800' }}>Boards</Text>
      <Text style={{ marginTop: 10, opacity: 0.7 }}>
        Próximo passo: listar boards. Aqui é só o esqueleto — bonito e obediente.
      </Text>
    </View>
  );
}
