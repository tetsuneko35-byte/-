import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>モーダル画面</Text>
      <Text style={styles.text}>この画面は必要に応じてカスタマイズできます</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
});
