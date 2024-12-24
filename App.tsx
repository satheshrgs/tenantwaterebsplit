import React, {useState, useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import {translations} from './src/translations/translations';

type ResultType = {
  homeMeterCost: number;
  waterMeterCost: number;
  mainTotal: number;
  subTotal: number;
  averageUnitCost: number;
  waterUnits: number;
  rawWaterCost: number;
  rawHomeCost: number;
  totalEbAmountCompare: number;
  individualWaterCost: number;
};

function App(): React.JSX.Element {
  const [mainMeterPrevious, setMainMeterPrevious] = useState<string>('');
  const [mainMeterCurrent, setMainMeterCurrent] = useState<string>('');
  const [subMeterPrevious, setSubMeterPrevious] = useState<string>('');
  const [subMeterCurrent, setSubMeterCurrent] = useState<string>('');
  const [ebAmount, setEbAmount] = useState<string>('');
  const [result, setResult] = useState<ResultType | null>(null);
  const [language, setLanguage] = useState<'en' | 'ta'>('ta');
  const t = translations[language];
  const viewShotRef = useRef<ViewShot | null>(null);

  const handleCalculate = (): void => {
    const mainTotal = Number(mainMeterCurrent) - Number(mainMeterPrevious);
    const subTotal = Number(subMeterCurrent) - Number(subMeterPrevious);
    const totalEbAmount = Number(ebAmount);
    const averageUnitCost = totalEbAmount / mainTotal;
    const waterUnits = mainTotal - subTotal;

    const waterEBCost = Math.round(waterUnits * averageUnitCost);
    const homeEBCost = Math.round(subTotal * averageUnitCost);
    const totalEbAmountCompare = waterEBCost + homeEBCost;
    const individualWaterCost = waterEBCost / 3;

    setResult({
      homeMeterCost: homeEBCost,
      waterMeterCost: waterEBCost,
      mainTotal,
      subTotal,
      averageUnitCost,
      waterUnits,
      rawWaterCost: waterEBCost,
      rawHomeCost: homeEBCost,
      totalEbAmountCompare,
      individualWaterCost,
    });
  };

  const formatResultText = (): string => {
    if (!result) {return '';}

    return `
      *${t.results.mainMeterPrevious} ${mainMeterPrevious}*
      *${t.results.mainMeterCurrent} ${mainMeterCurrent}*
      *${t.results.subMeterPrevious} ${subMeterPrevious}*
      *${t.results.subMeterCurrent} ${subMeterCurrent}*
      *${t.results.mainMeterUnits} ${mainMeterCurrent} - ${mainMeterPrevious} = ${result.mainTotal}*
      *${t.results.averageUnitCost} ${result.mainTotal} units / ₹${ebAmount} = ₹${result.averageUnitCost.toFixed(4)}*
      *${t.results.subMeterUnits} ${subMeterCurrent} - ${subMeterPrevious} = ${result.subTotal}*
      *${t.results.waterUnits} ${result.mainTotal} - ${result.subTotal} = ${result.waterUnits}*
      *${t.results.waterCost} ${result.waterUnits} * ₹${result.averageUnitCost.toFixed(4)} = ₹${result.waterMeterCost}*
      *${t.results.homeCost} ${result.subTotal} * ₹${result.averageUnitCost.toFixed(4)} = ₹${result.homeMeterCost}*
      *${t.results.totalEbAmount} ₹${result.waterMeterCost} + ₹${result.homeMeterCost} = ₹${result.totalEbAmountCompare}*
      *${t.results.individualWaterCost} ₹${result.waterMeterCost} / 3 = ₹${result.individualWaterCost.toFixed(2)}*
    `;
  };

  const handleShareText = async (): Promise<void> => {
    if (!result) {
      console.log('No results to share');
      return;
    }

    try {
      await Share.open({
        message: formatResultText(),
        title: t.shareTitle,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleShareScreenshot = async (): Promise<void> => {
    if (!result) {
      console.log('No results to share');
      return;
    }

    try {
      const uri = await viewShotRef.current?.capture();
      if (uri) {
        await Share.open({
          title: t.shareTitle,
          url: uri,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleReset = (): void => {
    setMainMeterPrevious('');
    setMainMeterCurrent('');
    setSubMeterPrevious('');
    setSubMeterCurrent('');
    setEbAmount('');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[styles.langButton, language === 'en' && styles.langButtonActive]}
            onPress={() => setLanguage('en')}>
            <Text style={[
              styles.langButtonText,
              language === 'en' && styles.langButtonTextActive,
            ]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langButton, language === 'ta' && styles.langButtonActive]}
            onPress={() => setLanguage('ta')}>
            <Text style={[
              styles.langButtonText,
              language === 'ta' && styles.langButtonTextActive,
            ]}>தமிழ்</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{t.title}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t.inputs.mainMeterPrevious}
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={mainMeterPrevious}
            onChangeText={setMainMeterPrevious}
          />
          <TextInput
            style={styles.input}
            placeholder={t.inputs.mainMeterCurrent}
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={mainMeterCurrent}
            onChangeText={setMainMeterCurrent}
          />
          <TextInput
            style={styles.input}
            placeholder={t.inputs.subMeterPrevious}
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={subMeterPrevious}
            onChangeText={setSubMeterPrevious}
          />
          <TextInput
            style={styles.input}
            placeholder={t.inputs.subMeterCurrent}
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={subMeterCurrent}
            onChangeText={setSubMeterCurrent}
          />
          <TextInput
            style={styles.input}
            placeholder={t.inputs.ebAmount}
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={ebAmount}
            onChangeText={setEbAmount}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonFlex]}
              onPress={handleCalculate}>
              <Text style={styles.buttonText}>{t.buttons.calculate}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonFlex, styles.resetButton]}
              onPress={handleReset}>
              <Text style={styles.buttonText}>{t.buttons.reset}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {result && (
          <>
            <ViewShot ref={viewShotRef} options={{format: 'jpg', quality: 0.9}}>
              <View style={styles.resultContainer}>
                <Text style={styles.resultText}>{t.results.mainMeterPrevious} {mainMeterPrevious}</Text>
                <Text style={styles.resultText}>{t.results.mainMeterCurrent} {mainMeterCurrent}</Text>

                <Text style={[styles.resultText, styles.marginTop]}>{t.results.subMeterPrevious} {subMeterPrevious}</Text>
                <Text style={styles.resultText}>{t.results.subMeterCurrent} {subMeterCurrent}</Text>

                <Text style={[styles.resultText, styles.marginTop]}>{t.results.mainMeterUnits} {mainMeterCurrent} - {mainMeterPrevious} = {result.mainTotal}</Text>
                <Text style={[styles.resultText]}>
                  {t.results.averageUnitCost} {result.mainTotal} units / ₹{ebAmount} = ₹{result.averageUnitCost.toFixed(4)}
                </Text>

                <Text style={[styles.resultText, styles.marginTop]}>{t.results.subMeterUnits} {subMeterCurrent} - {subMeterPrevious} = {result.subTotal}</Text>

                <Text style={[styles.resultText, styles.marginTop]}>{t.results.waterUnits} {result.mainTotal} - {result.subTotal} = {result.waterUnits}</Text>
                <Text style={styles.resultText}>{t.results.waterCost} {result.waterUnits} * ₹{result.averageUnitCost.toFixed(4)} = ₹{result.waterMeterCost}</Text>

                <Text style={[styles.resultText, styles.marginTop]}>{t.results.homeCost} {result.subTotal} * ₹{result.averageUnitCost.toFixed(4)} = ₹{result.homeMeterCost}</Text>

                <Text style={[styles.resultText, styles.marginTop]}>{t.results.totalEbAmount} ₹{result.waterMeterCost} + ₹{result.homeMeterCost} = ₹{result.totalEbAmountCompare}</Text>

                <Text style={[styles.resultText, styles.marginTop]}>{t.results.individualWaterCost} ₹{result.waterMeterCost} / 3 = ₹{result.individualWaterCost.toFixed(2)}</Text>

              </View>
            </ViewShot>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonFlex]}
                onPress={handleShareText}>
                <Text style={styles.buttonText}>{t.buttons.shareText}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonFlex]}
                onPress={handleShareScreenshot}>
                <Text style={styles.buttonText}>{t.buttons.shareScreenshot}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  inputContainer: {
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  resultText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  breakdownText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  marginTop: {
    marginTop: 15,
  },
  costSummary: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  resetButton: {
    backgroundColor: '#FF3B30',  // Red color for reset button
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  buttonFlex: {
    flex: 1,
    marginTop: 0,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  langButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  langButtonActive: {
    backgroundColor: '#007AFF',
  },
  langButtonText: {
    color: '#007AFF',
  },
  langButtonTextActive: {
    color: '#fff',
  },
});

export default App;
