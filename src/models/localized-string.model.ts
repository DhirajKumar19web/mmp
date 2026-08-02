import { Schema } from "mongoose";

export interface ILocalizedString {
  en: string;
  hi?: string;
  ar?: string;
  fr?: string;
  es?: string;
}

export const LocalizedStringSchema = new Schema<ILocalizedString>(
  {
    en: {
      type: String,
      required: true,
      trim: true,
    },

    hi: {
      type: String,
      trim: true,
      default: null,
    },

    ar: {
      type: String,
      trim: true,
      default: null,
    },

    fr: {
      type: String,
      trim: true,
      default: null,
    },

    es: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    _id: false,
    versionKey: false,
  }
);
