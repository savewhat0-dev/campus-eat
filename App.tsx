import {useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,AppState,BackHandler,Keyboard,Linking,Platform,Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {SafeAreaProvider,SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {WebView} from 'react-native-webview';
import {appOrigin,verificationUrl} from './links';

const origin=appOrigin(process.env.EXPO_PUBLIC_SITE_URL||'https://campus-eat-v6je.onrender.com');
const home=origin+'/?app=1';
export default function App(){
 const web=useRef<WebView<{}>>(null),keyboard=useRef(false),lastLink=useRef(''),page=useRef({url:home,canGoBack:false});
 const [source,setSource]=useState(home),[error,setError]=useState(false),[loading,setLoading]=useState(true),[paste,setPaste]=useState(false),[link,setLink]=useState('');
 const enter=(url:string)=>{const target=verificationUrl(url,origin);if(!target)return false;if(lastLink.current===url)return true;lastLink.current=url;setSource(target);setError(false);setPaste(false);setLink('');return true;};
 useEffect(()=>{
  Linking.getInitialURL().then(url=>url&&enter(url)).catch(()=>{});
  const sub=Linking.addEventListener('url',e=>{if(!enter(e.url))Alert.alert('Invalid link','Request a new BMU Eats sign-in link.');});
  const show=Keyboard.addListener('keyboardDidShow',()=>{keyboard.current=true}),hide=Keyboard.addListener('keyboardDidHide',()=>{keyboard.current=false});
  const back=BackHandler.addEventListener('hardwareBackPress',()=>{if(keyboard.current){Keyboard.dismiss();return true;}if(paste){setPaste(false);return true;}if(error){Alert.alert('Close BMU Eats?','You can reopen the app at any time.',[{text:'Stay',style:'cancel'},{text:'Close',onPress:()=>BackHandler.exitApp()}]);return true;}if(new URL(page.current.url).pathname!=='/'){if(page.current.canGoBack)web.current?.goBack();else setSource(home);return true;}web.current?.injectJavaScript("window.dispatchEvent(new Event('bmueats-native-back'));true;");return true;});
  const focus=AppState.addEventListener('change',s=>{if(s==='active')web.current?.injectJavaScript("window.dispatchEvent(new Event('focus'));true;");});
  return()=>{sub.remove();show.remove();hide.remove();back.remove();focus.remove()};
 },[paste,error]);
 function allow(url:string){
  try{const u=new URL(url);if(u.protocol==='https:'&&u.origin===origin)return true;
   if(u.protocol==='bmueats:'){enter(url);return false;}
   if(['https:','mailto:','tel:'].includes(u.protocol))Alert.alert('Open another app?','This link opens outside BMU Eats.',[{text:'Cancel',style:'cancel'},{text:'Open',onPress:()=>{Linking.openURL(url).catch(()=>Alert.alert('Cannot open link','No suitable app is available.'));}}]);
  }catch{}return false;
 }
 return <SafeAreaProvider><SafeAreaView style={styles.safe} edges={['top','bottom']}><StatusBar style="dark"/>
  <View style={styles.appBar}><Text style={styles.brand}>BMU Eats</Text><Pressable accessibilityRole="button" onPress={()=>setPaste(v=>!v)}><Text style={styles.link}>Open sign-in link</Text></Pressable></View>
  {paste&&<View style={styles.paste}><Text style={styles.title}>Return from your email</Text><Text style={styles.body}>Copy the verification link from your university email and paste it here. It stays inside this app.</Text><TextInput accessibilityLabel="Email sign-in link" value={link} onChangeText={setLink} autoCapitalize="none" autoCorrect={false} secureTextEntry placeholder="Paste your BMU Eats sign-in link" style={styles.input}/><Pressable style={styles.button} onPress={()=>{if(!enter(link.trim()))Alert.alert('Invalid link','Use the BMU Eats link from your email.');}}><Text style={styles.buttonText}>Verify and continue</Text></Pressable></View>}
  {error?<View style={styles.empty}><Text style={styles.title}>Cannot reach BMU Eats</Text><Text style={styles.body}>Check your internet connection and try again. A sleeping server may take a moment to start.</Text><Pressable style={styles.button} onPress={()=>{setError(false);setLoading(true);web.current?.reload();}}><Text style={styles.buttonText}>Try again</Text></Pressable></View>:<WebView<{}> ref={web} style={styles.web} source={{uri:source}} applicationNameForUserAgent="BMUEatsApp/1.0" originWhitelist={['https://*','bmueats://*']} onShouldStartLoadWithRequest={r=>allow(r.url)} onOpenWindow={e=>{if(allow(e.nativeEvent.targetUrl))setSource(e.nativeEvent.targetUrl)}} javaScriptEnabled domStorageEnabled sharedCookiesEnabled thirdPartyCookiesEnabled={false} mixedContentMode="never" allowFileAccess={false} allowFileAccessFromFileURLs={false} allowUniversalAccessFromFileURLs={false} geolocationEnabled={false} setSupportMultipleWindows allowsBackForwardNavigationGestures cacheEnabled incognito={false} webviewDebuggingEnabled={__DEV__} onNavigationStateChange={s=>{page.current={url:s.url,canGoBack:s.canGoBack}}} onLoadStart={()=>setLoading(true)} onLoadEnd={()=>setLoading(false)} onError={()=>{setError(true);setLoading(false)}} onHttpError={e=>{try{const failed=new URL(e.nativeEvent.url),current=new URL(page.current.url);if(e.nativeEvent.statusCode>=400&&failed.origin===current.origin&&failed.pathname===current.pathname){setError(true);setLoading(false)}}catch{}}} onMessage={e=>{
   try{if(new URL(e.nativeEvent.url).origin!==origin)return;const message=JSON.parse(e.nativeEvent.data);if(message.type==='exit-request'&&Platform.OS==='android')Alert.alert('Close BMU Eats?','Your saved bag and session will be kept on this device.',[{text:'Stay',style:'cancel'},{text:'Close',onPress:()=>BackHandler.exitApp()}]);}catch{}
  }}/>}
  {loading&&!error&&<View pointerEvents="none" style={styles.loader}><ActivityIndicator color="#12653f"/><Text style={styles.body}>Opening BMU Eats…</Text></View>}
 </SafeAreaView></SafeAreaProvider>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#f8faf4'},web:{flex:1,backgroundColor:'#f8faf4'},appBar:{paddingHorizontal:16,paddingVertical:10,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderBottomWidth:1,borderBottomColor:'#e2e9db'},brand:{fontSize:22,fontStyle:'italic',fontWeight:'700',color:'#07533b'},link:{fontSize:12,color:'#286749',padding:8},paste:{padding:18,gap:12,backgroundColor:'#fff'},title:{fontSize:22,fontWeight:'700',color:'#153c2c'},body:{fontSize:14,lineHeight:21,color:'#5d7061'},input:{borderWidth:1,borderColor:'#b6c7ae',borderRadius:12,padding:12,color:'#213b2a'},button:{padding:14,borderRadius:12,backgroundColor:'#12653f',alignItems:'center'},buttonText:{color:'#fff',fontWeight:'700'},empty:{flex:1,justifyContent:'center',padding:28,gap:20},loader:{position:'absolute',bottom:32,alignSelf:'center',flexDirection:'row',gap:10,padding:12,borderRadius:12,backgroundColor:'#fff'}});
