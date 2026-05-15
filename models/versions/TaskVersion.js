const taskVersionSchema = new Schema(
    {
      taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
      version: { type: Number, required: true },
      payload: { type: Schema.Types.Mixed, required: true },
      submittedByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      submittedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
  )
  taskVersionSchema.index({ taskId: 1, version: 1 }, { unique: true })