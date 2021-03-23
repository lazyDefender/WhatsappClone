#!/bin/bash
set -e
IFS='|'

AWSCLOUDFORMATIONCONFIG="{\
\"Region\": \"us-east-1\",\
\"DeploymentBucketName\": \"amplify-whatsappclone-dev-214505-deployment\",\
\"UnauthRoleName\": \"amplify-whatsappclone-dev-214505-unauthRole\",\
\"StackName\": \"amplify-whatsappclone-dev-214505\",\
\"StackId\": \"arn:aws:cloudformation:us-east-1:326469497554:stack/amplify-whatsappclone-dev-214505/c696eaf0-89b4-11eb-8fdb-1272d872aba7\",\
\"AuthRoleName\": \"amplify-whatsappclone-dev-214505-authRole\",\
\"UnauthRoleArn\": \"arn:aws:iam::326469497554:role/amplify-whatsappclone-dev-214505-unauthRole\",\
\"AuthRoleArn\": \"arn:aws:iam::326469497554:role/amplify-whatsappclone-dev-214505-authRole\"\
}"
PROVIDER_CONFIG="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"


AWS_CONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"default\"\
}"

mplify env import \
--name dev \
--config $PROVIDER_CONFIG \
--awsInfo $AWS_CONFIG \
--yes