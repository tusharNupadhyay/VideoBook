import { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAppDispatch,useAppSelector } from "../app/hooks";
import {resetSingleVideo} from "../features/video/videoSlice";
import { fetchVideoById,updateVideoDetails } from "../features/video/videoAction";

export default function EditPage(){
    
      const { videoId } = useParams();
      const dispatch = useAppDispatch();
      const {singleVideo,fetchLoading,fetchError} = useAppSelector(state => state.video);

 const { register, handleSubmit, reset, formState: { isDirty,isSubmitting,dirtyFields }  } = useForm({
  defaultValues: { title: "", description: "",thumbnail: null } 
});

  useEffect(() => {
  //fetch video details from videoId
    dispatch(fetchVideoById(videoId));
}, [videoId]);

  useEffect(() => {
  //only after reseting these values will isDirty become active
  if(singleVideo){
    reset({
      title: singleVideo.title,
      description: singleVideo.description || "",
      thumbnail: null
    })
  }
}, [singleVideo,reset]);

    if(fetchLoading) return <div className="text-white">Loading videos...</div>;
  

  const onSubmit = (data) => {
     const formData = new FormData();

  if (dirtyFields.title) {
    formData.append("title", data.title);
  }

  if (dirtyFields.description) {
    formData.append("description", data.description);
  }

  if (dirtyFields.thumbnail?.[0]) {
    formData.append("thumbnail", data.thumbnail[0]);
  }
  };

    return(

      <div className=" bg-black/90 flex-1 text-white">
     
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col mx-20 mt-10 ">
      <label className="block mb-2 font-medium">Title</label>
      <input
        {...register("title", )}
        className="border p-2 w-full mb-4 rounded"
      />
    

      <label className="block mb-2 font-medium">Description</label>
      <textarea
        {...register("description")}
        className="border p-2 w-full mb-4 rounded"
      />
       <label className="block mb-2 font-medium">Avatar</label>
        <input
          type="file"
          accept="image/*"
          className="border p-2 w-full mb-4 rounded"
          {...register('avatar')}
        />

      <div className="flex gap-2">
        <button type="submit" disabled={!isDirty || isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Save
        </button>
        <button type="button"  className="px-4 py-2 border rounded hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </form>
    </div>
  );
    
}