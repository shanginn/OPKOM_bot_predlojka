import { Connection, WorkflowClient } from '@temporalio/client';
import {VoteType} from "./VoteType";

class Workflow {
    private static client: WorkflowClient;
    private constructor() { }

    public static async getClient(): Promise<WorkflowClient> {
        if (!this.client) {
            const temporal_cli_address = process.env.TEMPORAL_CLI_ADDRESS || '127.0.0.1:7233'
            const connection = await Connection.connect({
                address: temporal_cli_address,
            });

            this.client = new WorkflowClient({
                connection
            });
        }

        return this.client;
    }

    public static async startPostWorkflow(
        messageId: number,
        authorId: number,
    ) {
        const client = await this.getClient();

        console.log(`Starting workflow with id ${messageId}`)

        client.start('PostWorkflow', {
            taskQueue: 'default',
            args: [{
                messageId: messageId,
                authorId: authorId,
            }],
            workflowId: `${messageId}`,
        });
    }

    public static async getWorkflow(workflowId: string) {
        const client = await this.getClient();

        return client.getHandle(workflowId);
    }

    public static async vote(
        postId: number,
        voterId: number,
        voteType: VoteType,
    ) {
        const workflow = await this.getWorkflow(`${postId}`);

        await workflow.signal(
            'vote',
            voterId,
            voteType,
        );
    }

    public static async getVotesCount(
        postId: number,
    ) {
        const workflow = await this.getWorkflow(`${postId}`);

        return await workflow.query('countVotes');
    }
}

export default Workflow;
