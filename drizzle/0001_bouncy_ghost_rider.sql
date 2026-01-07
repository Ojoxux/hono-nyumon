ALTER TABLE "todo_items" DROP CONSTRAINT "todo_items_todo_list_id_todo_lists_id_fk";
--> statement-breakpoint
ALTER TABLE "todo_items" ADD CONSTRAINT "todo_items_todo_list_id_todo_lists_id_fk" FOREIGN KEY ("todo_list_id") REFERENCES "public"."todo_lists"("id") ON DELETE cascade ON UPDATE restrict;