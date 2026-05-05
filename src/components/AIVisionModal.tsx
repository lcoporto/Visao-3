import React, { useState, useEffect, useRef } from 'react';
import { Camera, Search, Plus, Loader2, Sparkles, AlertCircle, ShoppingCart, Image as ImageIcon, X } from 'lucide-react';
import { identifyPartFromImage, searchMarketPrices } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

export default function AIVisionModal({ isOpen, onClose, onFinish }: { isOpen: boolean, onClose: () => void, onFinish: (data: any) => void }) {
  const [step, setStep] = useState<'camera' | 'identifying' | 'searching' | 'result'>('camera');
  const [image, setImage] = useState<string | null>(null);
  const [identifiedData, setIdentifiedData] = useState<any>(null);
  const [marketPrices, setMarketPrices] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && step === 'camera') {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
  };

  const processImage = async (base64: string, displayUrl: string) => {
    setImage(displayUrl);
    setStep('identifying');
    stopCamera();

    try {
      const data = await identifyPartFromImage(base64);
      setIdentifiedData(data);
      setStep('searching');
      const prices = await searchMarketPrices(data.name);
      setMarketPrices(prices);
      setStep('result');
    } catch (error) {
      console.error("AI Logic Error", error);
      setStep('camera');
    }
  };

  const capture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const fullUrl = canvas.toDataURL('image/png');
      const base64 = fullUrl.split(',')[1];
      processImage(base64, fullUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fullUrl = reader.result as string;
        const base64 = fullUrl.split(',')[1];
        processImage(base64, fullUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b flex justify-between items-center bg-[#141414] text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-lg">
              <Sparkles size={20} className="text-blue-400" />
            </div>
            <h3 className="font-bold text-xl uppercase tracking-tighter">AutoStock Vision</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {step === 'camera' && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl group">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-dashed border-white/20 pointer-events-none rounded-2xl m-4"></div>
                  
                  <div className="absolute inset-x-0 bottom-8 flex justify-center items-center gap-8">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30 transition-all"
                      title="Upload da Galeria"
                    >
                      <ImageIcon size={24} />
                    </button>

                    <button 
                      onClick={capture}
                      className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-8 border-white/20 active:scale-95 transition-transform shadow-xl"
                    >
                      <div className="w-14 h-14 rounded-full border-2 border-black/10 bg-gray-50"></div>
                    </button>

                    <div className="w-14 h-14 opacity-0"></div> {/* Spacer to center camera */}
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Aponte a câmera ou selecione uma foto da galeria</p>
                </div>
              </motion.div>
            )}

            {(step === 'identifying' || step === 'searching') && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <div>
                  <h4 className="font-bold text-lg">
                    {step === 'identifying' ? 'Analisando geometria da peça...' : 'Pesquisando menor preço no mercado...'}
                  </h4>
                  <p className="text-gray-500">Usando Gemini AI para processamento avançado.</p>
                </div>
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex gap-6">
                  <img src={image!} className="w-32 h-32 rounded-2xl object-cover shadow-lg border-2 border-gray-100" alt="Captured" />
                  <div className="flex-1">
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">Peça Identificada</span>
                    <h4 className="text-2xl font-black mt-1 uppercase">{identifiedData?.name}</h4>
                    <p className="text-gray-500 font-medium">{identifiedData?.category}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {identifiedData?.compatibility.map((c: string) => (
                        <span key={c} className="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart size={18} className="text-blue-600" />
                    <h5 className="font-bold">Análise de Mercado Web</h5>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <PriceBox label="Mínimo" value={`R$ ${marketPrices?.min}`} />
                    <PriceBox label="Médio" value={`R$ ${marketPrices?.avg}`} color="blue" />
                    <PriceBox label="Máximo" value={`R$ ${marketPrices?.max}`} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <span className="font-bold">Melhor Opção:</span>
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">{marketPrices?.bestProvider}</span>
                  </div>
                </div>

                <button 
                  onClick={() => onFinish({ ...identifiedData, marketPrices })}
                  className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  CADASTRAR PEÇA NO ESTOQUE
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </div>
  );
}

function PriceBox({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className={`p-4 rounded-xl ${color === 'blue' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-blue-100'}`}>
      <p className={`text-[10px] font-bold uppercase ${color === 'blue' ? 'text-white/70' : 'text-gray-400'}`}>{label}</p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
}
