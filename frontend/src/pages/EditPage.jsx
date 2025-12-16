import { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function EditPage(){
    
      const { videoId } = useParams();
const [video, setVideo] = useState(null);

 const { register, handleSubmit, reset, formState: { errors }  } = useForm({
  defaultValues: { title: "", description: "" } // initial empty
});

  useEffect(() => {
  //fetch video details from videoId
}, [videoId]);

  useEffect(() => {
  if (video) {
    reset({
      title: video.title,
      description: video.description,
    });
  }
}, [video, reset]);

  const onSubmit = (data) => {
    console.log("Form data:", data);
    // Call API to update video
  };

    return(
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto p-6 bg-gray-50">
      <label className="block mb-2 font-medium">Title</label>
      <input
        {...register("title", { required: "Title is required" })}
        className="border p-2 w-full mb-4 rounded"
      />
      {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}

      <label className="block mb-2 font-medium">Description</label>
      <textarea
        {...register("description")}
        className="border p-2 w-full mb-4 rounded"
      />

      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save
        </button>
        <button type="button" className="px-4 py-2 border rounded hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </form>
  );
    
}