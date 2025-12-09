import { Plus, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import type { ServiceType } from "@/types";

interface AddItemFormProps {
    show: boolean;
    onToggle: () => void;
    newItem: {
        name: string;
        description: string;
        price: string;
        image: string;
        category: string;
    };
    onItemChange: (item: any) => void;
    onSubmit: () => void;
    currentServiceType: ServiceType;
    isDragging: boolean;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onImageUpload: (file: File) => void;
}

const AddItemForm = ({
    show,
    onToggle,
    newItem,
    onItemChange,
    onSubmit,
    currentServiceType,
    isDragging,
    onDrop,
    onDragOver,
    onDragLeave,
    onImageUpload
}: AddItemFormProps) => {
    return (
        <div>
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-2 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
            >
                <span className="flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    إضافة {currentServiceType.itemLabel}
                </span>
                {show ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {show && (
                <div className="space-y-2 animate-fade-in mt-2">
                    <input
                        type="text"
                        placeholder={`اسم ${currentServiceType.itemLabel}`}
                        value={newItem.name}
                        onChange={(e) => onItemChange({ ...newItem, name: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                    />
                    <textarea
                        placeholder="المواصفات / الوصف"
                        value={newItem.description}
                        onChange={(e) => onItemChange({ ...newItem, description: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary min-h-[60px] resize-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="text"
                            placeholder="السعر (EGP)"
                            value={newItem.price}
                            onChange={(e) => onItemChange({ ...newItem, price: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                        />
                        <select
                            value={newItem.category}
                            onChange={(e) => onItemChange({ ...newItem, category: e.target.value })}
                            className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                        >
                            {currentServiceType.categories.filter(cat => cat.id !== "all").map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border"
                            }`}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
                            className="hidden"
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                            <ImageIcon className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground mb-1">
                                {newItem.image ? "تم رفع الصورة" : "اسحب الصورة هنا أو اضغط للرفع"}
                            </p>
                            {newItem.image && (
                                <img src={newItem.image} alt="Preview" className="w-full h-20 object-cover rounded mt-2" />
                            )}
                        </label>
                    </div>

                    <input
                        type="text"
                        placeholder="أو أدخل رابط الصورة"
                        value={newItem.image}
                        onChange={(e) => onItemChange({ ...newItem, image: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs bg-input border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                    />

                    <button
                        onClick={onSubmit}
                        disabled={!newItem.name || !newItem.price || !newItem.category}
                        className="w-full py-1.5 px-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                        <Plus className="w-3 h-3" />
                        إضافة {currentServiceType.itemLabel}
                    </button>
                </div>
            )}
        </div>
    );
};

export default AddItemForm;
