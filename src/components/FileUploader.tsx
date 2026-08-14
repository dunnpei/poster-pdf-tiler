'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import { SourceMedia } from '@/types/tiler';
import { renderPdfPage } from '@/lib/pdf-renderer';

interface FileUploaderProps {
  onMediaLoaded: (media: SourceMedia) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onMediaLoaded,
  isLoading,
  setIsLoading,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        throw new Error('不支援的檔案格式，請上傳 PDF 或圖片檔 (PNG, JPG, WEBP)');
      }

      if (isPdf) {
        const result = await renderPdfPage(file, 1, 3.0);
        onMediaLoaded({
          type: 'pdf',
          fileName: file.name,
          fileSize: file.size,
          width: result.width,
          height: result.height,
          aspectRatio: result.width / result.height,
          imageElement: result.canvas,
          pdfDoc: result.pdfDoc,
          numPages: result.numPages,
        });
      } else {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
          onMediaLoaded({
            type: 'image',
            fileName: file.name,
            fileSize: file.size,
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
            imageElement: img,
          });
          setIsLoading(false);
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          setIsLoading(false);
          setErrorMessage('圖片讀取失敗，請確認檔案是否損壞。');
        };

        img.src = objectUrl;
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '檔案解析失敗');
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-sky-500 bg-sky-500/10 scale-[1.01]'
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/png, image/jpeg, image/webp, application/pdf"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20 text-white">
              {isLoading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-100">
              {isLoading ? '檔案解析中...' : '拖放檔案至此，或點擊選擇檔案'}
            </h3>
            <p className="text-sm text-slate-400">
              支援高解析度圖片 (PNG, JPG, WEBP) 及多頁/單頁 PDF 檔案
            </p>
          </div>

          <div className="flex items-center space-x-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center">
              <ImageIcon className="mr-1.5 h-4 w-4 text-sky-400" /> 高解析圖片保真
            </span>
            <span className="flex items-center">
              <FileText className="mr-1.5 h-4 w-4 text-emerald-400" /> 向量 PDF 自動轉繪
            </span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
          {errorMessage}
        </div>
      )}
    </div>
  );
};
