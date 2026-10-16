import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Entry = mongoose.model("Entry", entrySchema);

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getAll = async () => Entry.find().lean();

export const findById = async (id) => Entry.findById(id).lean();

export const create = async (data) => (await Entry.create(data)).toObject();

export const updateById = async (id, data) =>
  Entry.findByIdAndUpdate(id, data, { returnDocument: "after" }).lean();

export const removeById = async (id) => {
  await Entry.findByIdAndDelete(id);
};

export const patchById = async (id, newVal) => {
  await Entry.updateOne({ _id: id }, { favorite: newVal });
};
